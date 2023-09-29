#!/bin/bash -e

set -o pipefail


ENVOY_SRC_DIR="${ENVOY_SRC_DIR:-../envoy}"
ENVOY_ARCHIVE_DIR="${ENVOY_ARCHIVE_DIR:-../archive}"
ENVOY_VERSION=$(git -C "$ENVOY_SRC_DIR" rev-parse HEAD)
ENVOY_ARCHIVE_VERSION=$(git -C "$ENVOY_ARCHIVE_DIR" rev-parse HEAD)
UPDATED=

if [[ -n "$COMMITTER_NAME" ]]; then
    git config --global user.name "$COMMITTER_NAME"
fi

if [[ -n "$COMMITTER_EMAIL" ]]; then
    git config --global user.email "$COMMITTER_EMAIL"
fi

sync_envoy () {
    echo "Syncing Envoy -> ${ENVOY_VERSION}"
    bazel run //bazel:update envoy "${ENVOY_VERSION}"
    if git diff --quiet --exit-code; then
        echo "No Envoy changes"
    else
        git commit versions.bzl -m "Sync Envoy @${ENVOY_VERSION}"
        git show
        UPDATED=1
    fi
}

sync_archive () {
    echo "Syncing Archive -> ${ENVOY_ARCHIVE_VERSION}"
    bazel run //bazel:update envoy_archive "${ENVOY_ARCHIVE_VERSION}"
    if git diff --quiet --exit-code; then
        echo "No Archive changes"
    else
        git commit versions.bzl -m "Sync Archive @${ENVOY_ARCHIVE_VERSION}"
        git show
        UPDATED=1
    fi
}

sync_envoy
sync_archive

if [[ -n "$UPDATED" ]]; then
    git push origin HEAD:main
else
    echo "Nothing to push"
fi
