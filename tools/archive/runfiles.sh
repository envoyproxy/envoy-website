#!/usr/bin/env bash

# Shared, tiny runfiles helper for the archive write-side binaries.
if [[ ! -d "${RUNFILES_DIR:-/dev/null}" && ! -f "${RUNFILES_MANIFEST_FILE:-/dev/null}" ]]; then
    if [[ -f "$0.runfiles_manifest" ]]; then
        export RUNFILES_MANIFEST_FILE="$0.runfiles_manifest"
    elif [[ -f "$0.runfiles/MANIFEST" ]]; then
        export RUNFILES_MANIFEST_FILE="$0.runfiles/MANIFEST"
    elif [[ -d "$0.runfiles" ]]; then
        export RUNFILES_DIR="$0.runfiles"
    fi
fi
if [[ -f "${RUNFILES_DIR:-/dev/null}/bazel_tools/tools/bash/runfiles/runfiles.bash" ]]; then
    # shellcheck disable=SC1090,SC1091
    source "${RUNFILES_DIR}/bazel_tools/tools/bash/runfiles/runfiles.bash"
elif [[ -f "${RUNFILES_MANIFEST_FILE:-/dev/null}" ]]; then
    # shellcheck disable=SC1090
    source "$(grep -m1 "^bazel_tools/tools/bash/runfiles/runfiles.bash " "${RUNFILES_MANIFEST_FILE}" | cut -d ' ' -f2-)"
else
    echo "ERROR: cannot initialize Bazel runfiles" >&2
    exit 1
fi

archive_rlocation() {
    rlocation "$1"
}

archive_require_gcp_key() {
    if [[ -z "${GCP_KEY_PATH:-}" || ! -r "${GCP_KEY_PATH:-}" ]]; then
        echo "ERROR: GCP_KEY_PATH is unset or unreadable" >&2
        exit 1
    fi
    export RCLONE_CONFIG_GCS_TYPE="google cloud storage"
    export RCLONE_CONFIG_GCS_SERVICE_ACCOUNT_FILE="${GCP_KEY_PATH}"
    # Never attempt to create buckets; the SA has object perms only.
    export RCLONE_CONFIG_GCS_NO_CHECK_BUCKET=true
    # Buckets use uniform bucket-level access; per-object ACLs are rejected.
    export RCLONE_CONFIG_GCS_BUCKET_POLICY_ONLY=true
    unset RCLONE_CONFIG_GCS_ANONYMOUS || true
}
