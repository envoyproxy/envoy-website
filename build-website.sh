#!/bin/bash
set -ex

# build docs with jekyll
jekyll build

build_latest_docs () {
    local bucket envoy_commit version
    bucket="https://storage.googleapis.com/envoy-postsubmit"
    upstream="https://github.com/envoyproxy/envoy"

    envoy_commit=${INCOMING_HOOK_BODY:-"$(git ls-remote "${upstream}" main | cut -f1)"}
    envoy_commit="$(echo "$envoy_commit" | head -c7)"
    echo "BUILDING LATEST DOCS FOR ${envoy_commit}"

    # fetch the rst tarball
    curl "${bucket}/${envoy_commit}/docs/envoy-docs-rst.tar.gz" > envoy-docs-rst.tar.gz

    # fetch the envoy version
    version="$(curl -L -s "${upstream}/raw/${envoy_commit}/VERSION")"

    # build the docs
    mkdir -p _site/docs/envoy
    envoy.docs.sphinx_runner \
         --build_sha="${envoy_commit}" \
         --version="${version}" \
         --overwrite \
         ./envoy-docs-rst.tar.gz \
         ./_site/docs/envoy/latest
}

build_latest_docs

# copy envoy docs to the main website
# (we don't want jekyll to parse the docs)
cp -r docs/ _site/docs/
