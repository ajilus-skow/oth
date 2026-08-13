#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
repository="${RUNNER_REPOSITORY:?RUNNER_REPOSITORY=owner/repository is required}"
remote_host="${IOS_REMOTE_HOST:-ajilus-air.local}"
remote_user="${IOS_REMOTE_USER:-skow}"
remote_key="${IOS_REMOTE_SSH_KEY:-$HOME/.ssh/id_ed25519_mac_air}"
installer="${root_dir}/tools/ci/install-actions-runner.sh"

command -v gh >/dev/null || { echo 'GitHub CLI is required.' >&2; exit 1; }
gh auth status >/dev/null
ssh_args=(-i "${remote_key}" -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new)

linux_token="$(gh api --method POST "repos/${repository}/actions/runners/registration-token" --jq .token)"
printf '%s\n' "${linux_token}" | "${installer}" --url "https://github.com/${repository}" --name "$(hostname -s)-oth-linux" --labels oth-linux
unset linux_token

remote_installer=".cache/oth-ci/install-actions-runner.sh"
ssh "${ssh_args[@]}" "${remote_user}@${remote_host}" 'mkdir -p "$HOME/.cache/oth-ci"'
scp "${ssh_args[@]}" "${installer}" "${remote_user}@${remote_host}:${remote_installer}" >/dev/null
mac_token="$(gh api --method POST "repos/${repository}/actions/runners/registration-token" --jq .token)"
printf '%s\n' "${mac_token}" | ssh "${ssh_args[@]}" "${remote_user}@${remote_host}" "bash '${remote_installer}' --url 'https://github.com/${repository}' --name 'ajilus-air-oth-mac' --labels oth-mac"
unset mac_token

"${root_dir}/tools/ci/check-runners.sh"
