#!/bin/bash -e

set -o pipefail


ENVOY_VERSION="${ENVOY_VERSION:-$(git -C "${ENVOY_SRC_DIR:-../envoy}" rev-parse HEAD)}"
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
    if git diff --quiet --exit-code; then
        echo "No Envoy changes"
    else
        git commit MODULE.bazel .bazelrc -m "Sync Envoy @${ENVOY_VERSION}"
        git show
        UPDATED=1
    fi
}

sync_envoy

if [[ -n "$UPDATED" ]]; then
    git push origin HEAD:main
else
    echo "Nothing to push"
fi
