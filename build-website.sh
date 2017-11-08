#!/bin/bash
set -ex

# build docs with jekyll
jekyll build

# copy envoy docs to the main website
# (we don't want jekyll to parse the docs)
cp -R envoy/ _site/envoy/
