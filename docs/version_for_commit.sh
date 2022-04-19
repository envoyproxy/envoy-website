#!/bin/bash -e

UPSTREAM="https://github.com/envoyproxy/envoy"
VERSION_FILE_PATH=VERSION.txt

envoy_commit="$1"

# fetch the envoy version
# use the full commit hash as retrieving files with the short commit
# is unreliable
curl -Ls "${UPSTREAM}/raw/${envoy_commit}/${VERSION_FILE_PATH}"
