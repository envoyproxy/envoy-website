#!/bin/bash -e

set -o pipefail

BAZEL="${BAZEL:-bazel}"
OUTPUT_DIR="${1:-_site}"
OUTPUT_DIR="$(realpath "${OUTPUT_DIR}")"

if  [[ -e "$OUTPUT_DIR" ]]; then
    echo "Path to build the website (${OUTPUT_DIR}) exists, removing contents"
    rm -rf "${OUTPUT_DIR:?}"/*
fi

mkdir -p "${OUTPUT_DIR}"
BAZEL_BUILD_ARGS=()

if [[ -n "$CI" ]]; then
    BAZEL_BUILD_ARGS=(--config=ci)
fi

$BAZEL run \
         "${BAZEL_BUILD_ARGS[@]}" \
         --@envoy//tools/tarball:target=//site \
         @envoy//tools/tarball:unpack \
         "$OUTPUT_DIR"

if [[ -n "$CI" ]]; then
    $BAZEL shutdown || :
fi
