#!/usr/bin/bash -e

set -o pipefail

IGNORED_PATHS=(
    docker-compose.yml
    docker
    netlify-should-run.sh)
TARGET_BRANCH=main
readarray -t CHANGED_FILES < <(git diff --name-only "$TARGET_BRANCH")

for FILE in "${CHANGED_FILES[@]}"; do
    if ! [[ " ${IGNORED_PATHS[@]} " =~ " ${FILE%%/*} " ]] && ! [[ " ${IGNORED_PATHS[@]} " =~ " ${FILE} " ]]; then
        exit 1
    fi
done

exit 0
