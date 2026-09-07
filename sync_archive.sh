#!/bin/bash -e

set -o pipefail


DEP="envoy_archive_manifest"
UPDATED=

if [[ -n "$COMMITTER_NAME" ]]; then
    git config --global user.name "$COMMITTER_NAME"
fi

if [[ -n "$COMMITTER_EMAIL" ]]; then
    git config --global user.email "$COMMITTER_EMAIL"
fi

sync_archive () {
    local url sha
    bazel build "//:dependency_versions"
    url="$(jq -r ".${DEP}.url" bazel-bin/dependency_shas.json)"
    sha="$(curl -sfL "${url}" | sha256sum | cut -d' ' -f1)"
    echo "Syncing Archive manifest -> ${sha}"
    sed -i "/\"${DEP}\": {/,/^    },\$/ s/\"sha256\": \"[^\"]*\"/\"sha256\": \"${sha}\"/" versions.bzl
    if git diff --quiet --exit-code; then
        echo "No Archive changes"
    else
        git commit versions.bzl -m "Sync Archive manifest ${sha:0:12}"
        git show
        UPDATED=1
    fi
}

sync_archive

if [[ -n "$UPDATED" ]]; then
    git push origin HEAD:main
else
    echo "Nothing to push"
fi
