load("@aspect_bazel_lib//lib:diff_test.bzl", "diff_test")
load("@aspect_bazel_lib//lib:jq.bzl", "jq")
load("@bazel_skylib//rules:common_settings.bzl", "string_flag")
load("@rules_shell//shell:sh_binary.bzl", "sh_binary")
load(":archive_rules.bzl", "archive_rclone_genrule", "string_flag_value")

ARCHIVE_JQ_ARGS = [
    "-L",
    "tools/archive/jq",
]

# Content-addressed manifest output must be deterministic.
MANIFEST_JQ_ARGS = [
    "-S",
    "-c",
]

string_flag(
    name = "archive_bucket",
    build_setting_default = "envoy-cncf-archive",
    visibility = ["//visibility:public"],
)

string_flag(
    name = "meta_bucket",
    build_setting_default = "envoy-cncf-meta",
    visibility = ["//visibility:public"],
)

string_flag_value(
    name = "archive_bucket_value",
    flag = ":archive_bucket",
)

string_flag_value(
    name = "meta_bucket_value",
    flag = ":meta_bucket",
)

archive_rclone_genrule(
    name = "listing",
    outs = ["listing.json"],
    cmd = """
"$${RCLONE}" --config /dev/null lsjson --recursive "gcs:$${ARCHIVE_BUCKET}/envoy/docs" > "$@"
""",
)

archive_rclone_genrule(
    name = "existing",
    outs = ["existing.json"],
    cmd = """
if ! "$${RCLONE}" --config /dev/null cat "gcs:$${META_BUCKET}/envoy/docs/versions.json" > "$@" 2>/dev/null; then
    printf '{}\\n' > "$@"
fi
""",
)

jq(
    name = "have",
    srcs = [":listing"],
    out = "have.json",
    filter_file = "jq/have.jq",
    args = ARCHIVE_JQ_ARGS,
    data = ["jq/versions.jq"],
)

archive_rclone_genrule(
    name = "sidecars",
    outs = ["sidecars.json"],
    cmd = """
work="$$(mktemp -d)"
trap 'rm -rf "$${work}"' EXIT
if ! "$${RCLONE}" --config /dev/null lsf --files-only "gcs:$${META_BUCKET}/envoy/docs/versions" > "$${work}/names.txt" 2>/dev/null; then
    printf '[]\\n' > "$@"
    exit 0
fi
printf '[' > "$@"
sep=""
while IFS= read -r name; do
    case "$${name}" in
        v*.json) ;;
        *) continue ;;
    esac
    if [[ -n "$${sep}" ]]; then printf ',' >> "$@"; fi
    "$${RCLONE}" --config /dev/null cat "gcs:$${META_BUCKET}/envoy/docs/versions/$${name}" >> "$@"
    sep=1
done < "$${work}/names.txt"
printf ']\\n' >> "$@"
""",
)

jq(
    name = "sidecars_by_version",
    srcs = [":sidecars"],
    out = "sidecars_by_version.json",
    filter_file = "jq/sidecars.jq",
)

jq(
    name = "new_entries",
    srcs = [],
    out = "new_entries.json",
    filter_file = "jq/new_entries.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "--slurpfile",
        "existing",
        "$(location :existing)",
        "--slurpfile",
        "have",
        "$(location :have)",
        "--slurpfile",
        "sidecars",
        "$(location :sidecars_by_version)",
    ],
    expand_args = True,
    data = [
        ":existing",
        ":have",
        ":sidecars_by_version",
        "jq/new_entries_lib.jq",
        "jq/versions.jq",
    ],
)

jq(
    name = "missing_sidecars",
    srcs = [],
    out = "missing_sidecars.txt",
    filter_file = "jq/missing_sidecars.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "-r",
        "--slurpfile",
        "existing",
        "$(location :existing)",
        "--slurpfile",
        "have",
        "$(location :have)",
        "--slurpfile",
        "sidecars",
        "$(location :sidecars_by_version)",
    ],
    expand_args = True,
    data = [
        ":existing",
        ":have",
        ":sidecars_by_version",
    ],
)

jq(
    name = "manifest",
    srcs = [],
    out = "versions.json",
    filter_file = "jq/manifest.jq",
    args = ARCHIVE_JQ_ARGS + MANIFEST_JQ_ARGS + [
        "-n",
        "--slurpfile",
        "existing",
        "$(location :existing)",
        "--slurpfile",
        "have",
        "$(location :have)",
        "--slurpfile",
        "new_entries",
        "$(location :new_entries)",
        "--rawfile",
        "archive_bucket",
        "$(location :archive_bucket_value)",
        "--argjson",
        "stable_minors",
        "4",
    ],
    expand_args = True,
    data = [
        ":archive_bucket_value",
        ":existing",
        ":have",
        ":new_entries",
        "jq/versions.jq",
    ],
)

jq(
    name = "dropped",
    srcs = [],
    out = "dropped.txt",
    filter_file = "jq/dropped.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "-r",
        "--slurpfile",
        "existing",
        "$(location :existing)",
        "--slurpfile",
        "have",
        "$(location :have)",
    ],
    expand_args = True,
    data = [
        ":existing",
        ":have",
        "jq/versions.jq",
    ],
)

jq(
    name = "changed",
    srcs = [],
    out = "changed.txt",
    filter_file = "jq/changed.jq",
    args = [
        "-n",
        "--slurpfile",
        "existing",
        "$(location :existing)",
        "--slurpfile",
        "manifest",
        "$(location :manifest)",
    ],
    expand_args = True,
    data = [
        ":existing",
        ":manifest",
    ],
)

sh_binary(
    name = "backfill",
    srcs = ["backfill.sh"],
    data = [
        ":archive_bucket_value",
        ":meta_bucket_value",
        "digest.sh",
        "runfiles.sh",
        "@rclone//:rclone",
    ],
    deps = ["@bazel_tools//tools/bash/runfiles"],
    env = {
        "ARCHIVE_BUCKET_FILE": "$(rlocationpath :archive_bucket_value)",
        "META_BUCKET_FILE": "$(rlocationpath :meta_bucket_value)",
        "RCLONE_BIN": "$(rlocationpath @rclone//:rclone)",
    },
    visibility = ["//visibility:public"],
)

sh_binary(
    name = "publish_manifest",
    srcs = ["publish_manifest.sh"],
    data = [
        ":changed",
        ":dropped",
        ":manifest",
        ":meta_bucket_value",
        ":missing_sidecars",
        "runfiles.sh",
        "@rclone//:rclone",
    ],
    deps = ["@bazel_tools//tools/bash/runfiles"],
    env = {
        "CHANGED_FILE": "$(rlocationpath :changed)",
        "DROPPED_FILE": "$(rlocationpath :dropped)",
        "MANIFEST_FILE": "$(rlocationpath :manifest)",
        "META_BUCKET_FILE": "$(rlocationpath :meta_bucket_value)",
        "MISSING_SIDECARS_FILE": "$(rlocationpath :missing_sidecars)",
        "RCLONE_BIN": "$(rlocationpath @rclone//:rclone)",
    },
    visibility = ["//visibility:public"],
)

# Offline fixture transforms and golden-file tests.
jq(
    name = "have_fixture",
    srcs = ["testdata/listing.json"],
    out = "have.fixture.json",
    filter_file = "jq/have.jq",
    args = ARCHIVE_JQ_ARGS,
    data = ["jq/versions.jq"],
    testonly = True,
)

jq(
    name = "sidecars_by_version_fixture",
    srcs = ["testdata/sidecars.json"],
    out = "sidecars_by_version.fixture.json",
    filter_file = "jq/sidecars.jq",
    testonly = True,
)

jq(
    name = "sidecars_by_version_missing_fixture",
    srcs = ["testdata/sidecars-missing.json"],
    out = "sidecars_by_version_missing.fixture.json",
    filter_file = "jq/sidecars.jq",
    testonly = True,
)

jq(
    name = "new_entries_fixture",
    srcs = [],
    out = "new_entries.fixture.json",
    filter_file = "jq/new_entries.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "have",
        "$(location :have_fixture)",
        "--slurpfile",
        "sidecars",
        "$(location :sidecars_by_version_fixture)",
    ],
    expand_args = True,
    data = [
        ":have_fixture",
        ":sidecars_by_version_fixture",
        "jq/new_entries_lib.jq",
        "jq/versions.jq",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "new_entries_missing_sidecar_fixture",
    srcs = [],
    out = "new_entries_missing_sidecar.fixture.json",
    filter_file = "jq/new_entries.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "have",
        "$(location :have_fixture)",
        "--slurpfile",
        "sidecars",
        "$(location :sidecars_by_version_missing_fixture)",
    ],
    expand_args = True,
    data = [
        ":have_fixture",
        ":sidecars_by_version_missing_fixture",
        "jq/new_entries_lib.jq",
        "jq/versions.jq",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "missing_sidecars_fixture",
    srcs = [],
    out = "missing_sidecars.fixture.txt",
    filter_file = "jq/missing_sidecars.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "-r",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "have",
        "$(location :have_fixture)",
        "--slurpfile",
        "sidecars",
        "$(location :sidecars_by_version_missing_fixture)",
    ],
    expand_args = True,
    data = [
        ":have_fixture",
        ":sidecars_by_version_missing_fixture",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "missing_sidecars_none_fixture",
    srcs = [],
    out = "missing_sidecars_none.fixture.txt",
    filter_file = "jq/missing_sidecars.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "-r",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "have",
        "$(location :have_fixture)",
        "--slurpfile",
        "sidecars",
        "$(location :sidecars_by_version_fixture)",
    ],
    expand_args = True,
    data = [
        ":have_fixture",
        ":sidecars_by_version_fixture",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "manifest_fixture",
    srcs = [],
    out = "versions.fixture.json",
    filter_file = "jq/manifest.jq",
    args = ARCHIVE_JQ_ARGS + MANIFEST_JQ_ARGS + [
        "-n",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "have",
        "$(location :have_fixture)",
        "--slurpfile",
        "new_entries",
        "$(location :new_entries_fixture)",
        "--arg",
        "archive_bucket",
        "archive",
        "--argjson",
        "stable_minors",
        "4",
    ],
    expand_args = True,
    data = [
        ":have_fixture",
        ":new_entries_fixture",
        "jq/versions.jq",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "dropped_fixture",
    srcs = [],
    out = "dropped.fixture.txt",
    filter_file = "jq/dropped.jq",
    args = ARCHIVE_JQ_ARGS + [
        "-n",
        "-r",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "have",
        "$(location :have_fixture)",
    ],
    expand_args = True,
    data = [
        ":have_fixture",
        "jq/versions.jq",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "changed_true_fixture",
    srcs = [],
    out = "changed_true.fixture.txt",
    filter_file = "jq/changed.jq",
    args = [
        "-n",
        "--slurpfile",
        "existing",
        "$(location testdata/existing-manifest.json)",
        "--slurpfile",
        "manifest",
        "$(location :manifest_fixture)",
    ],
    expand_args = True,
    data = [
        ":manifest_fixture",
        "testdata/existing-manifest.json",
    ],
    testonly = True,
)

jq(
    name = "changed_false_fixture",
    srcs = [],
    out = "changed_false.fixture.txt",
    filter_file = "jq/changed.jq",
    args = [
        "-n",
        "--slurpfile",
        "existing",
        "$(location testdata/manifest-same-generated.json)",
        "--slurpfile",
        "manifest",
        "$(location :manifest_fixture)",
    ],
    expand_args = True,
    data = [
        ":manifest_fixture",
        "testdata/manifest-same-generated.json",
    ],
    testonly = True,
)

[
    diff_test(
        name = name + "_test",
        file1 = ":" + name + "_fixture",
        file2 = "testdata/golden/" + golden,
    )
    for name, golden in {
        "changed_false": "changed_false.txt",
        "changed_true": "changed_true.txt",
        "dropped": "dropped.txt",
        "have": "have.json",
        "manifest": "versions.json",
        "missing_sidecars": "missing_sidecars.txt",
        "missing_sidecars_none": "missing_sidecars_none.txt",
        "new_entries": "new_entries.json",
        "new_entries_missing_sidecar": "new_entries_missing_sidecar.json",
    }.items()
]
