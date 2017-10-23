#!/bin/bash
set -ex

# build docs with jekyll
bundle exec jekyll build

# copy envoy docs to the main website
# (we don't want jekyll to parse the docs)
cp -r envoy/ _site/envoy/
