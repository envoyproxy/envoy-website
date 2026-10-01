#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1090
for h in "${RUNFILES_DIR:-}/_main/tools/archive/runfiles.sh" "${RUNFILES_DIR:-}/envoy_archive/tools/archive/runfiles.sh" "$0.runfiles/_main/tools/archive/runfiles.sh" "$0.runfiles/envoy_archive/tools/archive/runfiles.sh"; do [[ -f "$h" ]] && source "$h" && break; done
if ! declare -F archive_rlocation >/dev/null; then echo "ERROR: cannot find tools/archive/runfiles.sh" >&2; exit 1; fi

# shellcheck disable=SC1090
for h in "${RUNFILES_DIR:-}/_main/tools/archive/digest.sh" "${RUNFILES_DIR:-}/envoy_archive/tools/archive/digest.sh" "$0.runfiles/_main/tools/archive/digest.sh" "$0.runfiles/envoy_archive/tools/archive/digest.sh"; do [[ -f "$h" ]] && source "$h" && break; done
if ! declare -F archive_write_sidecar >/dev/null; then echo "ERROR: cannot find tools/archive/digest.sh" >&2; exit 1; fi

# Backfills the per-version sidecar
# (gs://$META_BUCKET/envoy/docs/versions/<version>.json) for versions that
# are present in the archive bucket but have no sidecar. Sidecars are never
# overwritten.

VERSIONS=(); ALL=false; DRY_RUN=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --version=*) VERSIONS+=("${1#--version=}"); shift ;;
        --version) VERSIONS+=("$2"); shift 2 ;;
        --all) ALL=true; shift ;;
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "Unknown argument: $1" >&2; exit 2 ;;
    esac
done
[[ "${ALL}" == "true" || "${#VERSIONS[@]}" -gt 0 ]] || { echo "Usage: $0 (--version=<vX.Y.Z> ... | --all) [--dry-run]" >&2; exit 2; }
archive_require_gcp_key

RCLONE="$(archive_rlocation "${RCLONE_BIN}")"
ARCHIVE_BUCKET="$(cat "$(archive_rlocation "${ARCHIVE_BUCKET_FILE}")")"
META_BUCKET="$(cat "$(archive_rlocation "${META_BUCKET_FILE}")")"

# Sidecars already present in the meta bucket, as bare versions (no .json).
# The prefix may not exist yet - treat that as "none".
mapfile -t EXISTING < <(
    "${RCLONE}" --config /dev/null lsf --files-only "gcs:${META_BUCKET}/envoy/docs/versions" 2>/dev/null \
        | sed -n 's/\.json$//p' || true)

has_sidecar() {
    local version="$1" existing
    for existing in "${EXISTING[@]}"; do
        [[ "${existing}" == "${version}" ]] && return 0
    done
    return 1
}

if [[ "${ALL}" == "true" ]]; then
    mapfile -t ARCHIVED < <(
        "${RCLONE}" --config /dev/null lsf --dirs-only "gcs:${ARCHIVE_BUCKET}/envoy/docs" \
            | sed 's#/$##' \
            | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' || true)
    printf 'Archived versions: %d, existing sidecars: %d\n' "${#ARCHIVED[@]}" "${#EXISTING[@]}"
    VERSIONS=()
    for version in "${ARCHIVED[@]}"; do
        has_sidecar "${version}" || VERSIONS+=("${version}")
    done
fi

if [[ "${#VERSIONS[@]}" -eq 0 ]]; then
    echo "Nothing to backfill"
    exit 0
fi
printf 'Backfilling %d version(s)\n' "${#VERSIONS[@]}"

work="$(mktemp -d)"; trap 'rm -rf "${work}"' EXIT
for version in "${VERSIONS[@]}"; do
    if has_sidecar "${version}"; then
        printf 'Sidecar already exists for %s, skipping\n' "${version}"
        continue
    fi
    dir="${work}/${version}"
    mkdir -p "${dir}"
    "${RCLONE}" --config /dev/null copy "gcs:${ARCHIVE_BUCKET}/envoy/docs/${version}" "${dir}"
    sidecar="${work}/${version}.sidecar.json"
    archive_write_sidecar "${version}" "${dir}" "${sidecar}"
    if [[ "${DRY_RUN}" == "true" ]]; then
        printf '%s: %s\n' "${version}" "$(cat "${sidecar}")"
    else
        "${RCLONE}" --config /dev/null copyto \
            --ignore-existing \
            --header-upload "Cache-Control: public, max-age=300" \
            "${sidecar}" "gcs:${META_BUCKET}/envoy/docs/versions/${version}.json"
        printf 'Backfilled sidecar for %s\n' "${version}"
    fi
    rm -rf "${dir}" "${sidecar}"
done
