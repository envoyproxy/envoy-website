load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@rules_pkg//:mappings.bzl", "pkg_files")
load("@base_pip3//:requirements.bzl", "entry_point", "requirement")
load("@rules_python//python:defs.bzl", "py_binary")

filegroup(
    name = "releases_html",
    srcs = glob([
        "envoy/v*/*",
        "envoy/v*/**/*",
    ]),
    visibility = ["//visibility:public"],
)

filegroup(
    name = "releases_inventories",
    srcs = glob(["envoy/v*/objects.inv"]),
    visibility = ["//visibility:public"],
)

alias(
    name = "sphinx_runner",
    actual = entry_point("envoy.docs.sphinx_runner"),
)

pkg_files(
    name = "docs",
    srcs = [":releases_html"],
    prefix = "docs",
    strip_prefix = "",
    visibility = ["//visibility:public"],
)
