load("@aspect_bazel_lib//lib:jq.bzl", "jq")
load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

exports_files(["nav.yaml"])

# Derived from the manifest published by the `envoyproxy/archive` reconciler
# (`@envoy_archive_manifest//file`, pinned by sha256 in `MODULE.bazel`).
# jq cannot emit YAML directly, but YAML is a superset of JSON, so this is
# read unchanged by `yaml.safe_load` in `pelicanconf.py`.
jq(
    name = "versions_yaml",
    srcs = ["@envoy_archive_manifest//file"],
    out = "versions.yaml",
    filter_file = "versions.jq",
)

jq(
    name = "versions_browser_base_json",
    srcs = ["@envoy_archive_manifest//file"],
    out = "versions-browser-base.json",
    filter_file = "versions-browser.jq",
)

genrule(
    name = "docs_nav_json",
    srcs = ["nav.yaml"],
    outs = ["docs-nav.json"],
    cmd = """
    printf '[' > $@
    awk -v out="$@" '
      BEGIN { first = 1 }
      /^- text:/ {
        text = $0
        sub(/^- text:[ ]*/, "", text)
      }
      /^[ ]+url:/ {
        url = $0
        sub(/^[ ]+url:[ ]*/, "", url)
        gsub(/"/, "\\\\\"", text)
        gsub(/"/, "\\\\\"", url)
        if (!first) {
          printf "," >> out
        }
        first = 0
        printf("{\\"text\\":\\"%s\\",\\"url\\":\\"%s\\"}", text, url) >> out
      }
    ' $(location nav.yaml)
    printf ']' >> $@
    """,
)

genrule(
    name = "versions_json",
    srcs = [
        ":docs_nav_json",
        ":versions_browser_base_json",
    ],
    outs = ["versions.json"],
    cmd = """
    jq -nc \
      --slurpfile versions $(location :versions_browser_base_json) \
      --slurpfile nav $(location :docs_nav_json) \
      '$$versions[0] + {nav: $$nav[0]}' > $@
    jq -e 'has("latest_stable") and has("stable") and has("archived") and has("nav")' $@ > /dev/null
    """,
    visibility = ["//visibility:public"],
)

pkg_files(
    name = "yaml_files",
    srcs = glob(["*.yaml"]) + [":versions_yaml"],
    prefix = "data",
    strip_prefix = "",
)

pkg_filegroup(
    name = "data",
    srcs = [":yaml_files"],
    visibility = ["//visibility:public"],
)
