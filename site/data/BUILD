load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

pkg_files(
    name = "yaml_files",
    srcs = glob(["*.yaml"]) + ["@envoy_archive//:versions.yaml"],
    strip_prefix = "",
    prefix = "data",
)

pkg_filegroup(
    name = "data",
    srcs = [":yaml_files"],
    visibility = ["//visibility:public"],
)
