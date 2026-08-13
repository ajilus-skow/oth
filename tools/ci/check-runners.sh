#!/usr/bin/env bash
set -euo pipefail

repository="${RUNNER_REPOSITORY:?RUNNER_REPOSITORY=owner/repository is required}"
runner_json="$(gh api "repos/${repository}/actions/runners")"

printf '%s' "${runner_json}" | jq -r \
  '.runners[] | [.name, .os, .status, (if .busy then "busy" else "idle" end), (.labels | map(.name) | join(","))] | @tsv'

for required_label in oth-linux oth-mac; do
  if ! printf '%s' "${runner_json}" | jq --exit-status --arg label "${required_label}" \
    '.runners | any(.status == "online" and (.labels | any(.name == $label)))' >/dev/null; then
    echo "No online repository runner has label '${required_label}'." >&2
    exit 1
  fi
done
