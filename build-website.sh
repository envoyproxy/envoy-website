#!/bin/bash
set -ex

INCOMING_HOOK_BODY=${INCOMING_HOOK_BODY:-}
BUCKET="https://storage.googleapis.com/envoy-postsubmit"
UPSTREAM="https://github.com/envoyproxy/envoy"
TMP_CHECKOUT=/tmp/repository
MAX_COMMITS=20
DOCS_PUBLISH_PATH=docs/envoy-docs-rst.tar.gz
VERSION_FILE_PATH=VERSION.txt

if [[ -e _site/docs ]]; then
    rm -rf _site/docs
fi

# build docs with jekyll
jekyll build

check_docs_build_availability () {
    local commit
    commit="$1"
    docs_bucket="${BUCKET}/${commit}/${DOCS_PUBLISH_PATH}"
    result="$(curl -IL "${docs_bucket}" 2>/dev/null | head -n 1 | cut -d$' ' -f2)"
    if [[ "$result" == "200" ]]; then
        return 0
    fi
    return 1
}

build_commit_sha () {
    local commit

    # first check the last commit on Envoy main
    commit=${INCOMING_HOOK_BODY:-"$(git ls-remote "${UPSTREAM}" main | cut -f1)"}

    if check_docs_build_availability "$commit"; then
        echo "$commit"
        return 0
    fi

    if [[ -e "$TMP_CHECKOUT" ]]; then
        rm -rf "$TMP_CHECKOUT"
    fi

    # Last commit has no published docs, check through git logs for a commit that does
    git clone --bare --filter=blob:none --no-checkout --single-branch --branch main "$UPSTREAM" "$TMP_CHECKOUT"
    read -ra commits <<< "$(git -C "$TMP_CHECKOUT" log --pretty=%P "-${MAX_COMMITS}" | xargs)"
    for commit in "${commits[@]}"; do
        short_commit="$(echo "$commit" | head -c7)"
        if check_docs_build_availability "$short_commit"; then
            echo "$commit"
            return 0
        fi
    done
}

build_latest_docs () {
    local envoy_commit version

    envoy_commit="$(build_commit_sha)"

    if [[ -z "$envoy_commit" ]]; then
        echo "Unable to find any published docs"
        exit 1
    fi

    short_commit="$(echo "$envoy_commit" | head -c7)"

    # fetch the rst tarball
    curl -Ls "${BUCKET}/${short_commit}/${DOCS_PUBLISH_PATH}" > envoy-docs-rst.tar.gz

    # fetch the envoy version
    # use the full commit hash as retrieving files with the short commit
    # is unreliable
    version="$(curl -Ls "${UPSTREAM}/raw/${envoy_commit}/${VERSION_FILE_PATH}")"

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
cp -a docs/* _site/docs/


ps auxw || true
