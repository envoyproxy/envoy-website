#!/usr/bin/env bash
set -e
set -o pipefail


IGNORED_PATHS=(
    docker-compose.yml
    docker
    netlify-should-run.sh)
TARGET_BRANCH=main

git fetch origin "$TARGET_BRANCH" --depth=1 2>/dev/null || true

CHANGED_FILES=()
while IFS= read -r file; do
    if [[ -n "$file" ]]; then
        CHANGED_FILES+=("$file")
    fi
done < <(git diff --name-only "origin/$TARGET_BRANCH")

# If we can't determine changed files, run the build
if [[ ${#CHANGED_FILES[@]} -eq 0 ]]; then
    echo "No changed files detected or unable to diff - running build" >&2
    exit 1
fi

for FILE in "${CHANGED_FILES[@]}"; do
    if ! [[ " ${IGNORED_PATHS[@]} " =~ " ${FILE%%/*} " ]] && ! [[ " ${IGNORED_PATHS[@]} " =~ " ${FILE} " ]]; then
        echo "Changed file requires build: $FILE" >&2
        exit 1
    fi
done

echo "Only ignored files changed - skipping build" >&2
exit 0
