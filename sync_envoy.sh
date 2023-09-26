#!/bin/bash -e

set -o pipefail


ENVOY_SRC_DIR="${ENVOY_SRC_DIR:-../envoy}"
ENVOY_VERSION=$(git -C "$ENVOY_SRC_DIR" rev-parse HEAD)

echo "Syncing Envoy -> ${ENVOY_VERSION}"

bazel run //bazel:update envoy "${ENVOY_VERSION}"

if [[ -n "$COMMITTER_NAME" ]]; then
    git config --global user.name "$COMMITTER_NAME"
fi

if [[ -n "$COMMITTER_EMAIL" ]]; then
    git config --global user.email "$COMMITTER_EMAIL"
fi

git commit versions.bzl -m "Sync Envoy @${ENVOY_VERSION}"

git show

git push origin HEAD:main
