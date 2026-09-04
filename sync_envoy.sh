#!/bin/bash -e

set -o pipefail


ENVOY_SRC_DIR="${ENVOY_SRC_DIR:-../envoy}"
ENVOY_VERSION=$(git -C "$ENVOY_SRC_DIR" rev-parse HEAD)
UPDATED=

if [[ -n "$COMMITTER_NAME" ]]; then
    git config --global user.name "$COMMITTER_NAME"
fi

if [[ -n "$COMMITTER_EMAIL" ]]; then
    git config --global user.email "$COMMITTER_EMAIL"
fi

sync_envoy () {
    echo "Syncing Envoy -> ${ENVOY_VERSION}"
    ENVOY_SHA256=$(curl -fsSL "https://github.com/envoyproxy/envoy/archive/${ENVOY_VERSION}.tar.gz" | sha256sum | cut -d' ' -f1)
    sed -i -E \
        -e "/archive_override\\(/,/^\\)/ s#archive/[0-9a-f]+\\.tar\\.gz#archive/${ENVOY_VERSION}.tar.gz#" \
        -e "/archive_override\\(/,/^\\)/ s#sha256 = \"[0-9a-f]+\"#sha256 = \"${ENVOY_SHA256}\"#" \
        -e "/archive_override\\(/,/^\\)/ s#strip_prefix = \"envoy-[0-9a-f]+#strip_prefix = \"envoy-${ENVOY_VERSION}#" \
        MODULE.bazel
    if git diff --quiet --exit-code; then
        echo "No Envoy changes"
    else
        git commit MODULE.bazel -m "Sync Envoy @${ENVOY_VERSION}"
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
