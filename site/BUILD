load("@bazel_skylib//rules:common_settings.bzl", "bool_flag")
load("@envoy_toolshed//website:macros.bzl", "static_website")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

exports_files([
    "requirements.txt",
])

filegroup(
    name = "config",
    srcs = ["pelicanconf.py"],
    visibility = ["//visibility:public"],
)

genrule(
    name = "empty",
    outs = ["empty.tar.gz"],
    cmd = """
    tar cf $@ .
    """,
)

pkg_tar(
    name = "docs",
    package_dir = "docs/envoy/latest",
    deps = ["@envoy//docs"],
)

label_flag(
    name = "docs_latest",
    build_setting_default = ":docs",
    visibility = ["//visibility:public"],
)

bool_flag(
    name = "no_docs_latest",
    build_setting_default = False,
)

config_setting(
    name = "disable_docs_latest",
    flag_values = {":no_docs_latest": "True"},
)

static_website(
    name = "site",
    compressor = "@envoy//tools/zstd",
    compressor_args = "-T0",
    content = "//site/content",
    data = "//site/data",
    extension = "tar.zst",
    theme = "//site/theme",
    deps = select({
        ":disable_docs_latest": [],
        "//conditions:default": [":docs_latest"],
    }),
)
