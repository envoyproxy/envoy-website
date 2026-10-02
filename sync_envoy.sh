#!/bin/bash -e

set -o pipefail


ENVOY_VERSION="${ENVOY_VERSION:-}"
MANIFEST_SHA="${MANIFEST_SHA:-}"
UPDATED=

if [[ -n "$COMMITTER_NAME" ]]; then
    git config --global user.name "$COMMITTER_NAME"
fi

if [[ -n "$COMMITTER_EMAIL" ]]; then
    git config --global user.email "$COMMITTER_EMAIL"
fi

sync_envoy () {
    echo "Syncing Envoy -> ${ENVOY_VERSION}"
    sed -i -E "/^git_override\(/,/^\)/ s#commit = \"[0-9a-f]{40}\"#commit = \"${ENVOY_VERSION}\"#" MODULE.bazel
    local envoy_bazelrc="${ENVOY_SRC_DIR:-../envoy}/.bazelrc"
    local registry
    registry="$(grep -m1 -oE 'https://raw\.githubusercontent\.com/envoyproxy/bazel-registry/[0-9a-f]{40}' "${envoy_bazelrc}" || true)"
    if [[ -z "${registry}" ]]; then
        echo "Failed to determine envoyproxy/bazel-registry from ${envoy_bazelrc}" >&2
        exit 1
    fi
    sed -i -E "s#^common --registry=https://raw\.githubusercontent\.com/envoyproxy/bazel-registry/[0-9a-f]{40}#common --registry=${registry}#" .bazelrc
}

sync_manifest () {
    if [[ ! "${MANIFEST_SHA}" =~ ^[0-9a-f]{64}$ ]]; then
        echo "Invalid manifest sha256: ${MANIFEST_SHA}" >&2
        exit 1
    fi

    local current_sha
    current_sha="$(
        sed -nE '/^http_file\(/,/^\)/ {
            /name = "envoy_archive_manifest"/,/^\)/ {
                s/^[[:space:]]*sha256 = "([0-9a-f]{64})",.*/\1/p
            }
        }' MODULE.bazel | head -n1
    )"
    if [[ -z "${current_sha}" ]]; then
        echo "Failed to determine envoy_archive_manifest sha256 from MODULE.bazel" >&2
        exit 1
    fi
    if [[ "${current_sha}" == "${MANIFEST_SHA}" ]]; then
        echo "Archive manifest is already up-to-date (${MANIFEST_SHA})"
        return
    fi

    sed -i -E "/^http_file\\(/,/^\\)/ {
        /name = \"envoy_archive_manifest\"/,/^\\)/ {
            s#url = \"https://storage.googleapis.com/envoy-cncf-meta/envoy/docs/manifest/sha256-[0-9a-f]{64}\\.json\",#url = \"https://storage.googleapis.com/envoy-cncf-meta/envoy/docs/manifest/sha256-${MANIFEST_SHA}.json\",#
            s#sha256 = \"[0-9a-f]{64}\",#sha256 = \"${MANIFEST_SHA}\",#
        }
    }" MODULE.bazel
    MANIFEST_UPDATED=1
}

if [[ -n "${ENVOY_VERSION}" ]]; then
    sync_envoy
    if ! git diff --quiet --exit-code -- MODULE.bazel .bazelrc; then
        ENVOY_UPDATED=1
    fi
fi

if [[ -n "${MANIFEST_SHA}" ]]; then
    sync_manifest
fi

if ! git diff --quiet --exit-code -- MODULE.bazel .bazelrc; then
    commit_args=()
    if [[ -n "${ENVOY_UPDATED:-}" ]]; then
        commit_args+=(-m "Sync Envoy @${ENVOY_VERSION}")
    else
        commit_args+=(-m "Sync archive manifest @${MANIFEST_SHA}")
    fi
    if [[ -n "${MANIFEST_UPDATED:-}" && -n "${ENVOY_UPDATED:-}" ]]; then
        commit_args+=(-m "Sync archive manifest @${MANIFEST_SHA}")
    fi
    git commit MODULE.bazel .bazelrc "${commit_args[@]}"
    git show
    UPDATED=1
fi

if [[ -n "${UPDATED}" ]]; then
    git push origin HEAD:main
else
    echo "Nothing to push"
fi
