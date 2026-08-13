#!/usr/bin/env bash
set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly COMMAND="${1:-build}"
readonly REMOTE_HOST="${IOS_REMOTE_HOST:-ajilus-air.local}"
readonly REMOTE_USER="${IOS_REMOTE_USER:-skow}"
readonly SSH_KEY="${IOS_REMOTE_SSH_KEY:-${HOME}/.ssh/id_ed25519_mac_air}"
readonly REMOTE_DIR="${IOS_REMOTE_DIR:-on-the-hook-ios-build}"
readonly REMOTE_TARGET="${REMOTE_USER}@${REMOTE_HOST}"
readonly ARTIFACT_DIR="${PROJECT_ROOT}/artifacts/ios-remote"
readonly APP_NAME="oth"
readonly BUNDLE_ID="com.ajilus.oth"

SSH_OPTIONS=(-i "${SSH_KEY}" -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new)

usage() {
  cat <<'EOF'
Usage: tools/scripts/ios-remote-build.sh [doctor|sync|build|run|verify|logs]

The Mac is an rsync build mirror. Make source edits locally; do not copy secrets
or signing material to the remote directory.
EOF
}

validate_local_tools() {
  local tool
  for tool in ssh rsync; do
    command -v "${tool}" >/dev/null 2>&1 || { echo "Missing local tool: ${tool}" >&2; exit 1; }
  done
  [[ -r "${SSH_KEY}" ]] || { echo "SSH private key is not readable: ${SSH_KEY}" >&2; exit 1; }
}

remote_doctor() {
  ssh "${SSH_OPTIONS[@]}" "${REMOTE_TARGET}" /bin/bash -s <<'REMOTE_SCRIPT'
set -euo pipefail
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"

missing=()
[[ -d "${DEVELOPER_DIR}" ]] || missing+=("Xcode at ${DEVELOPER_DIR}")
command -v node >/dev/null 2>&1 || missing+=("Node.js 22")
command -v npm >/dev/null 2>&1 || missing+=("npm")
command -v pod >/dev/null 2>&1 || missing+=("CocoaPods")
if ((${#missing[@]})); then
  printf 'Remote iOS builder is missing:\n' >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 1
fi
xcodebuild -version
node --version
npm --version
pod --version
printf 'Remote iOS builder is ready: %s@%s\n' "${USER}" "$(hostname)"
REMOTE_SCRIPT
}

sync_project() {
  local rsync_shell
  printf -v rsync_shell 'ssh -i %q -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new' "${SSH_KEY}"
  ssh "${SSH_OPTIONS[@]}" "${REMOTE_TARGET}" mkdir -p "${REMOTE_DIR}"
  rsync --archive --compress --delete \
    --filter='P node_modules/***' \
    --filter='P apps/mobile/ios/Pods/***' \
    --filter='P apps/mobile/ios/oth.xcworkspace/***' \
    --filter='P apps/mobile/ios/Podfile.lock' \
    --filter='P apps/mobile/ios/build/***' \
    --filter='P apps/mobile/ios/.xcode.env' \
    --filter='P apps/mobile/ios/.xcode.env.local' \
    --exclude '**/node_modules/' --exclude '**/Pods/' --exclude '**/build/' \
    --exclude '**/.git/' --exclude '/artifacts/' \
    -e "${rsync_shell}" "${PROJECT_ROOT}/" "${REMOTE_TARGET}:${REMOTE_DIR}/"
}

remote_prepare() {
  ssh "${SSH_OPTIONS[@]}" "${REMOTE_TARGET}" /bin/bash -s -- "${REMOTE_DIR}" <<'REMOTE_SCRIPT'
set -euo pipefail
remote_dir="$1"
[[ "${remote_dir}" = /* ]] || remote_dir="${HOME}/${remote_dir}"
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
cd "${remote_dir}"
npm ci --ignore-scripts --no-audit --no-fund
cd apps/mobile/ios
pod install
test -f oth.xcworkspace/contents.xcworkspacedata
REMOTE_SCRIPT
}

remote_build() {
  ssh "${SSH_OPTIONS[@]}" "${REMOTE_TARGET}" /bin/bash -s -- "${REMOTE_DIR}" "${APP_NAME}" <<'REMOTE_SCRIPT'
set -euo pipefail
remote_dir="$1"
app_name="$2"
[[ "${remote_dir}" = /* ]] || remote_dir="${HOME}/${remote_dir}"
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
cd "${remote_dir}/apps/mobile/ios"
mkdir -p "${HOME}/Library/Logs"
xcodebuild -workspace "${app_name}.xcworkspace" -scheme "${app_name}" -sdk iphonesimulator \
  -configuration Debug -derivedDataPath build build CODE_SIGNING_ALLOWED=NO \
  | tee "${HOME}/Library/Logs/on-the-hook-xcodebuild.log"
REMOTE_SCRIPT
}

download_artifact() {
  local rsync_shell
  printf -v rsync_shell 'ssh -i %q -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new' "${SSH_KEY}"
  mkdir -p "${ARTIFACT_DIR}"
  rsync --archive --compress --delete -e "${rsync_shell}" \
    "${REMOTE_TARGET}:${REMOTE_DIR}/apps/mobile/ios/build/Build/Products/Debug-iphonesimulator/${APP_NAME}.app/" \
    "${ARTIFACT_DIR}/${APP_NAME}.app/"
}

remote_run() {
  ssh "${SSH_OPTIONS[@]}" "${REMOTE_TARGET}" /bin/bash -s -- "${REMOTE_DIR}" "${APP_NAME}" "${BUNDLE_ID}" <<'REMOTE_SCRIPT'
set -euo pipefail
remote_dir="$1"
app_name="$2"
bundle_id="$3"
[[ "${remote_dir}" = /* ]] || remote_dir="${HOME}/${remote_dir}"
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
device="$(xcrun simctl list devices available | awk -F '[()]' '/iPhone/ {print $2; exit}')"
[[ -n "${device}" ]] || { echo 'No available iPhone simulator found.' >&2; exit 1; }
xcrun simctl boot "${device}" 2>/dev/null || true
open -a Simulator
xcrun simctl bootstatus "${device}" -b
xcrun simctl install "${device}" "${remote_dir}/apps/mobile/ios/build/Build/Products/Debug-iphonesimulator/${app_name}.app"
xcrun simctl launch "${device}" "${bundle_id}"
REMOTE_SCRIPT
}

remote_verify() {
  local app="${ARTIFACT_DIR}/${APP_NAME}.app"
  [[ -d "${app}" && -x "${app}/${APP_NAME}" ]] || { echo "Missing simulator artifact: ${app}" >&2; exit 1; }
  printf 'Local iOS artifact verified: %s\n' "${app}"
}

remote_logs() {
  local rsync_shell
  printf -v rsync_shell 'ssh -i %q -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new' "${SSH_KEY}"
  mkdir -p "${ARTIFACT_DIR}/logs"
  rsync --archive --compress -e "${rsync_shell}" \
    "${REMOTE_TARGET}:Library/Logs/on-the-hook-xcodebuild.log" "${ARTIFACT_DIR}/logs/xcodebuild.log" 2>/dev/null || true
  ssh "${SSH_OPTIONS[@]}" "${REMOTE_TARGET}" /bin/bash -s >"${ARTIFACT_DIR}/logs/simulator.log" <<'REMOTE_SCRIPT'
set +e
export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
xcrun simctl spawn booted log show --last 15m --style compact --predicate 'process == "oth"'
REMOTE_SCRIPT
  printf 'Remote logs collected under %s\n' "${ARTIFACT_DIR}/logs"
}

case "${COMMAND}" in
  doctor) validate_local_tools; remote_doctor ;;
  sync) validate_local_tools; remote_doctor; sync_project; remote_prepare ;;
  build) validate_local_tools; remote_doctor; sync_project; remote_prepare; remote_build; download_artifact ;;
  run) validate_local_tools; remote_doctor; sync_project; remote_prepare; remote_build; download_artifact; remote_run ;;
  verify) remote_verify ;;
  logs) validate_local_tools; remote_logs ;;
  -h|--help|help) usage ;;
  *) usage >&2; exit 2 ;;
esac
