load("@rules_pkg//pkg:mappings.bzl", "pkg_files")

pkg_files(
    name = "templates",
    srcs = glob(["**/*html"]),
    prefix = "theme/templates/extra",
    strip_prefix = "",
    visibility = ["//visibility:public"],
)
