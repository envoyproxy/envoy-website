#!/bin/bash
set -ex

# build docs with jekyll
jekyll build

# copy envoy docs to the main website
# (we don't want jekyll to parse the docs)
cp -r docs/ _site/docs/
cp -r envoy/ _site/envoy/
