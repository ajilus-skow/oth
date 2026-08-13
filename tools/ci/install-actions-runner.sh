#!/usr/bin/env bash
set -euo pipefail

runner_version="2.336.0"
runner_url=""
runner_name=""
runner_labels=""
install_dir="${OTH_RUNNER_INSTALL_DIR:-$HOME/.local/share/oth-actions-runner}"

usage() { echo "usage: $0 --url URL --name NAME --labels LABELS" >&2; exit 64; }
while (( $# > 0 )); do
  case "$1" in
    --url) runner_url="${2:-}"; shift 2 ;;
    --name) runner_name="${2:-}"; shift 2 ;;
    --labels) runner_labels="${2:-}"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "${runner_url}" && -n "${runner_name}" && -n "${runner_labels}" ]] || usage
IFS= read -r registration_token
[[ -n "${registration_token}" ]] || { echo "Registration token is required on stdin." >&2; exit 1; }

case "$(uname -s):$(uname -m)" in
  Linux:x86_64) archive="actions-runner-linux-x64-${runner_version}.tar.gz"; checksum="04cf0be1aff4c3ec3554466c39124ca250e3effd8873bb7e8d68535aa9505d5d"; service_kind=systemd ;;
  Darwin:arm64) archive="actions-runner-osx-arm64-${runner_version}.tar.gz"; checksum="8e8839c49b7060b6b2154f4931f815df330c27f167d53ef2239ee3dfce28b079"; service_kind=launchd ;;
  *) echo "Unsupported runner host: $(uname -s) $(uname -m)" >&2; exit 1 ;;
esac

mkdir -p "${install_dir}"
if [[ ! -x "${install_dir}/run.sh" ]]; then
  archive_path="$(mktemp)"
  curl --fail --silent --show-error --location "https://github.com/actions/runner/releases/download/v${runner_version}/${archive}" --output "${archive_path}"
  echo "${checksum}  ${archive_path}" | shasum -a 256 --check -
  tar --extract --gzip --file "${archive_path}" --directory "${install_dir}"
  rm "${archive_path}"
fi

if [[ ! -f "${install_dir}/.runner" ]]; then
  (cd "${install_dir}" && ./config.sh --unattended --replace --url "${runner_url}" --token "${registration_token}" --name "${runner_name}" --labels "${runner_labels}" --work _work)
fi

if [[ "${service_kind}" == systemd ]]; then
  unit_dir="$HOME/.config/systemd/user"
  state_dir="$HOME/.local/state/oth-actions-runner"
  mkdir -p "${unit_dir}" "${state_dir}"
  cat >"${unit_dir}/oth-actions-runner.service" <<EOF
[Unit]
Description=On The Hook GitHub Actions runner
After=network-online.target
[Service]
WorkingDirectory=${install_dir}
ExecStart=${install_dir}/run.sh
Restart=always
RestartSec=5
StandardOutput=append:${state_dir}/runner.log
StandardError=append:${state_dir}/runner.log
[Install]
WantedBy=default.target
EOF
  systemctl --user daemon-reload
  systemctl --user enable --now oth-actions-runner.service
else
  agent_dir="$HOME/Library/LaunchAgents"
  state_dir="$HOME/Library/Logs/OTHActionsRunner"
  agent_file="${agent_dir}/com.ajilus.oth-actions-runner.plist"
  mkdir -p "${agent_dir}" "${state_dir}"
  cat >"${agent_file}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.ajilus.oth-actions-runner</string>
  <key>ProgramArguments</key><array><string>${install_dir}/run.sh</string></array>
  <key>WorkingDirectory</key><string>${install_dir}</string>
  <key>EnvironmentVariables</key><dict>
    <key>DEVELOPER_DIR</key><string>/Applications/Xcode.app/Contents/Developer</string>
    <key>PATH</key><string>/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${state_dir}/runner.log</string>
  <key>StandardErrorPath</key><string>${state_dir}/runner.log</string>
</dict></plist>
EOF
  plutil -lint "${agent_file}"
  launchctl bootout "gui/$(id -u)/com.ajilus.oth-actions-runner" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$(id -u)" "${agent_file}"
  launchctl kickstart -k "gui/$(id -u)/com.ajilus.oth-actions-runner"
fi

echo "Configured ${runner_name} with labels: ${runner_labels}"
