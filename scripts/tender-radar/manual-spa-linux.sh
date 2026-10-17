#!/usr/bin/env bash
set -euo pipefail
[[ "$(uname -s)" == Linux ]] || { echo 'Use a graphical Linux session; this launcher requires Linux network namespaces.' >&2; exit 1; }
for tool in sudo unshare ip setpriv node; do command -v "$tool" >/dev/null; done
mode="${1:-manual}"
[[ "$mode" == manual || "$mode" == ci ]] || { echo 'Unknown mode.' >&2; exit 1; }
if [[ "$mode" == manual ]]; then
  [[ -n "${DISPLAY:-}" && "$DISPLAY" == :* ]] || { echo 'A local X11/XWayland DISPLAY is required (no remote TCP display).' >&2; exit 1; }
fi
node_path="$(command -v node)"
sudo -- unshare --net -- bash -c '
  set -euo pipefail
  ip link set lo up
  [[ "$(ip -o link show | cut -d : -f 2)" == " lo" ]] || { echo "Unexpected network interface" >&2; exit 1; }
  exec setpriv --reuid="$1" --regid="$2" --init-groups \
    env -i PATH="$4" HOME="$5" JAVA_HOME="$6" DISPLAY="$7" XAUTHORITY="$8" \
    "$3" scripts/tender-radar/manual-spa.mjs "$9"
' _ "$(id -u)" "$(id -g)" "$node_path" "$PATH" "$HOME" "${JAVA_HOME:-}" "${DISPLAY:-}" "${XAUTHORITY:-$HOME/.Xauthority}" "$mode"
