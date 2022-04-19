#!/bin/bash -e

INCOMING_HOOK_BODY=${INCOMING_HOOK_BODY:-}
BUCKET="https://storage.googleapis.com/envoy-postsubmit"
UPSTREAM="https://github.com/envoyproxy/envoy"
TMP_CHECKOUT=/tmp/repository
MAX_COMMITS=20
DOCS_PUBLISH_PATH=docs/envoy-docs-rst.tar.gz


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
    # NOTICE!: This requires git version >= 2.26
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

build_commit_sha
