#!/bin/bash -e

set -o pipefail

BAZEL="${BAZEL:-bazel}"
OUTPUT_DIR="${1:-_site}"
OUTPUT_DIR="$(realpath "${OUTPUT_DIR}")"
OUTPUT_BASE="$($BAZEL info output_base 2>/dev/null)"


debug_jvm_fail () {
    RETURN_CODE="$?"
    JVM_OUT="$(find "${OUTPUT_BASE}" -name "jvm.out" 2>/dev/null)"

    if [[ -n "$JVM_OUT" && -s "$JVM_OUT" ]]; then
        echo
        echo "JVM out: ${JVM_OUT}"
        cat "$JVM_OUT"
        echo
    fi
    return "$RETURN_CODE"
}

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
         "$OUTPUT_DIR" || debug_jvm_fail

if [[ -n "$CI" ]]; then
    $BAZEL --timeout=5 shutdown > /dev/null 2>&1 || :
fi
