#!/bin/bash -e

BAZEL="${BAZEL:-bazel}"
OUTPUT_DIR="${1:-_site}"

if  [[ -e "$OUTPUT_DIR" ]]; then
    echo "Path to build the website (${OUTPUT_DIR}) exists, removing"
    rm -rf "${OUTPUT_DIR}"
fi

mkdir -p "${OUTPUT_DIR}"

# Fetch the latest Envoy commit that has downloadable rst docs
export ENVOY_COMMIT="$($BAZEL run //docs:latest_version)"

echo "Building website for Envoy commit: ${ENVOY_COMMIT}"
$BAZEL build \
    --action_env=ENVOY_COMMIT \
    --action_env=JEKYLL_ENV \
    //site:html

echo "Extracting website -> ${OUTPUT_DIR}"
tar zxf bazel-bin/site/html.tar.gz -C "${OUTPUT_DIR}"

if [[ -n "$CI" ]]; then
    $BAZEL shutdown || :
fi

echo "Website built (${ENVOY_COMMIT}) in ${OUTPUT_DIR}"
