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
