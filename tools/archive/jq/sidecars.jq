# Key an array of raw per-version sidecars by version.
#
# Usage: jq -f sidecars.jq <sidecars.json>

reduce .[] as $sidecar ({}; .[$sidecar.version] = $sidecar)
