#!/bin/bash -e

set -o pipefail

REBUILD_SCRIPT="https://raw.githubusercontent.com/envoyproxy/toolshed/refs/heads/main/sh/watch.sh"


# X-platform implementaion of working `realpath`
get_realpath() {
    if command -v realpath >/dev/null 2>&1; then
        realpath "$1" 2>/dev/null || echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
    else
        echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
    fi
}


REBUILD="~/.cache/envoy-website/watch.sh)"
CURRENT_DIR="$(get_realpath $(dirname "${BASH_SOURCE[0]}"))"
BUILD_SCRIPT="${CURRENT_DIR}/build-website.sh"


download_script () {
    if [[ -e "$REBUILD" ]]; then
        echo "Using cached watch.sh ($REBUILD)"
        return
    fi
    rebuild_dir="$(dirname "$REBUILD")"
    mkdir -p "$rebuild_dir"
    echo "Downloading: ${REBUILD_SCRIPT}"
    curl -sL "$REBUILD_SCRIPT" > "$REBUILD"
    chmod +x "$REBUILD"
}


rebuild () {
    download_script
    "$REBUILD" "${CURRENT_DIR}/site" "$BUILD_SCRIPT"
}


rebuild
