#!/usr/bin/env bash
set -euo pipefail

# All test subprocesses share a new network namespace with loopback only.
# Downloads happen beforehand; artifact upload happens after this shell exits.
[[ "$(uname -s)" == Linux ]] || { echo 'Linux is required.' >&2; exit 1; }
for tool in sudo unshare ip setpriv node; do command -v "$tool" >/dev/null; done
mode="${1:-acceptance}"
[[ "$mode" == acceptance || "$mode" == preflight ]] || { echo 'Unknown test mode.' >&2; exit 1; }
node_path="$(command -v node)"
sudo -- unshare --net -- bash -c '
  set -euo pipefail
  ip link set lo up
  if [[ "$6" == preflight ]]; then
    args=(test/acceptance/reproduce-worker.mjs bounded raw-natural)
  else
    args=(scripts/tender-radar/acceptance.mjs)
  fi
  exec setpriv --reuid="$1" --regid="$2" --init-groups \
    env -i PATH="$4" HOME="$5" JAVA_HOME="$7" "$3" "${args[@]}"
' _ "$(id -u)" "$(id -g)" "$node_path" "$PATH" "$HOME" "$mode" "${JAVA_HOME:-}"
