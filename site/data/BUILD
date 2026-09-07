load("@aspect_bazel_lib//lib:jq.bzl", "jq")
load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

exports_files(["nav.yaml"])

# Derived from the manifest published by the `envoyproxy/archive` reconciler
# (`@envoy_archive_manifest//file`, pinned by sha256 in `//:versions.bzl`).
# jq cannot emit YAML directly, but YAML is a superset of JSON, so this is
# read unchanged by `yaml.safe_load` in `pelicanconf.py`.
jq(
    name = "versions_yaml",
    srcs = ["@envoy_archive_manifest//file"],
    out = "versions.yaml",
    filter_file = "versions.jq",
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
