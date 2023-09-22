load("@rules_pkg//pkg:mappings.bzl", "pkg_filegroup", "pkg_files")
load("@rules_pkg//pkg:pkg.bzl", "pkg_tar")

genrule(
    name = "versions",
    cmd = """
    $(location //tools/versions:release_versions) \
        $(locations //docs:releases_inventories) "" \
        > $@
    """,
    outs = ["versions.yaml"],
    tools = [
        "//tools/versions:release_versions",
        "//docs:releases_inventories",
    ],
)

pkg_files(
    name = "yaml_files",
    srcs = glob(["*.yaml"]) + [":versions.yaml"],
    strip_prefix = "",
    prefix = "data",
)

pkg_filegroup(
    name = "data",
    srcs = [":yaml_files"],
    visibility = ["//visibility:public"],
)
