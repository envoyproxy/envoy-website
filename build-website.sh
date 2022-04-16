#!/bin/bash -e

OUTPUT_DIR="${1:-_site}"

if  [[ -e "$OUTPUT_DIR" ]]; then
    echo "Path to build the website (${OUTPUT_DIR}) exists, removing"
    rm -rf "${OUTPUT_DIR}"
fi

mkdir -p "${OUTPUT_DIR}"

# Fetch the latest Envoy commit that has downloadable rst docs
export ENVOY_COMMIT="$(bazel run //docs:latest_version)"

echo "Building website for Envoy commit: ${ENVOY_COMMIT}"
bazel build --action_env=ENVOY_COMMIT //site:html

echo "Extracting website -> ${OUTPUT_DIR}"
tar zxf bazel-bin/site/html.tar.gz -C "${OUTPUT_DIR}"

if [[ -n "$CI" ]]; then
    bazel shutdown || :
fi

echo "Website built (${ENVOY_COMMIT}) in ${OUTPUT_DIR}"
