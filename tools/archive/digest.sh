#!/usr/bin/env bash

# Shared content-digest helpers for the archive write side.
#
# The digest is a sha256 over the sorted lines "<relative-path>
# <sha256-hex-of-file>" for every regular file in a docs tree, where
# <relative-path> is relative to the tree root. Because it is computed from
# the files themselves rather than anything the storage backend happens to
# expose, it can be recomputed by anyone with a copy of the tree.

# _archive_tree_hashed_lines <dir> -> sorted "<relative-path> <sha256-hex>"
# lines for every regular file in <dir>, one traversal per call. Internal.
_archive_tree_hashed_lines() {
    local dir="$1"
    (cd "${dir}" && find . -type f -print0 | sort -z | xargs -r0 sha256sum) | sed 's|  \./|  |' | sed -E 's/^([0-9a-f]+)  (.*)$/\2 \1/' | LC_ALL=C sort
}

# archive_tree_digest <dir> -> prints "sha256:<hex>" for the tree.
archive_tree_digest() {
    local dir="$1"
    local lines
    lines="$(_archive_tree_hashed_lines "${dir}")"
    if [[ -z "${lines}" ]]; then
        echo "ERROR: cannot compute digest, no regular files under ${dir}" >&2
        return 1
    fi
    printf 'sha256:%s\n' "$(printf '%s\n' "${lines}" | sha256sum | cut -d' ' -f1)"
}

# archive_tree_objects <dir> -> count of regular files.
archive_tree_objects() {
    local dir="$1"
    find "${dir}" -type f | wc -l | tr -d ' '
}

# archive_write_sidecar <version> <dir> <out-file> -> writes the sidecar JSON
# for <dir> to <out-file>.
archive_write_sidecar() {
    local version="$1" dir="$2" out="$3"
    local lines objects digest published
    lines="$(_archive_tree_hashed_lines "${dir}")"
    if [[ -z "${lines}" ]]; then
        echo "ERROR: cannot compute digest, no regular files under ${dir}" >&2
        return 1
    fi
    objects="$(printf '%s\n' "${lines}" | wc -l | tr -d ' ')"
    digest="sha256:$(printf '%s\n' "${lines}" | sha256sum | cut -d' ' -f1)"
    published="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    printf '{"version": "%s", "digest": "%s", "objects": %s, "published": "%s"}\n' \
        "${version}" "${digest}" "${objects}" "${published}" > "${out}"
}
