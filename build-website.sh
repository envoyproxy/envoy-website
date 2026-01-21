#!/usr/bin/env bash

set -e -o pipefail

# Install libtinfo5 for Ubuntu Noble (24.04) compatibility
# LLVM requires libtinfo5 which is only available in Ubuntu 20.04 (Focal)
if [[ -n "$CI" ]] && [[ ! -f "$HOME/.local/lib/x86_64-linux-gnu/libtinfo.so.5" ]]; then
    echo "Installing libtinfo5 from Ubuntu Focal archive..."
    mkdir -p "$HOME/.local"
    wget -q http://security.ubuntu.com/ubuntu/pool/universe/n/ncurses/libtinfo5_6.2-0ubuntu2_amd64.deb
    dpkg -x libtinfo5_6.2-0ubuntu2_amd64.deb "$HOME/.local"
    rm -f libtinfo5_6.2-0ubuntu2_amd64.deb
    export LD_LIBRARY_PATH="$HOME/.local/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"
fi

BAZEL="${BAZEL:-bazel}"
OUTPUT_DIR="${1:-_site}"

if ! command -v "$BAZEL" &> /dev/null; then
    echo "bazel not found, exiting" >&2
    exit 1
fi

OUTPUT_BASE="$($BAZEL info output_base 2>/dev/null)"


# X-platform implementaion of working `realpath`
get_realpath() {
    if command -v realpath >/dev/null 2>&1; then
        realpath "$1" 2>/dev/null || echo "$(pwd)/$1"
    else
        echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
    fi
}


OUTPUT_DIR="$(get_realpath "${OUTPUT_DIR}")"


num_procs () {
    if command -v nproc >/dev/null 2>&1; then
        nproc
    else
        sysctl -n hw.ncpu
    fi
}


debug_jvm_fail () {
    RETURN_CODE="$?"
    echo "Bazel exited with error: ${RETURN_CODE}"
    JVM_OUT="$(find "${OUTPUT_BASE}" -name "jvm.out" 2>/dev/null)"

    if [[ -n "$JVM_OUT" && -s "$JVM_OUT" ]]; then
        echo
        echo "jvm.out: ${JVM_OUT}"
        cat "$JVM_OUT"
        echo
    fi
    return "$RETURN_CODE"
}


inject_ci_bazelrc () {
    {
        PROC_COUNT="$(num_procs)"
        PROCS=$((PROC_COUNT - 1))
        SPHINX_ARGS="-j 12 -v warn"
        echo "build:ci --action_env=SPHINX_RUNNER_ARGS=\"${SPHINX_ARGS}\""
        # echo "build:ci --local_ram_resources=20480"
    } > repo.bazelrc
}


if  [[ -e "$OUTPUT_DIR" ]]; then
    echo "Path to build the website (${OUTPUT_DIR}) exists, removing contents"
    rm -rf "${OUTPUT_DIR:?}"/*
fi

mkdir -p "${OUTPUT_DIR}"

if [[ -n "$BAZEL_BUILD_OPTIONS" ]]; then
    read -ra BAZEL_BUILD_OPTIONS <<< $BAZEL_BUILD_OPTIONS
else
    BAZEL_BUILD_OPTIONS=()
fi

if [[ -n "$CI" ]]; then
    BAZEL_BUILD_OPTIONS+=(--config=ci)
    inject_ci_bazelrc
fi

$BAZEL run \
         "${BAZEL_BUILD_OPTIONS[@]}" \
         --@envoy//tools/tarball:target=//site \
         @envoy//tools/tarball:unpack \
         "$OUTPUT_DIR" || debug_jvm_fail

if [[ -n "$CI" ]]; then
    $BAZEL --timeout=5 shutdown > /dev/null 2>&1 || :
fi
