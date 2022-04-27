load("@docs_pip3//:requirements.bzl", "requirement")

py_binary(
    name = "release_versions",
    srcs = ["release_versions.py"],
    data = [
        "//docs:releases_html",
    ],
    deps = [
        requirement("packaging"),
        requirement("pyyaml"),
    ],
    args = ["$(location //docs:releases_html)"],
    visibility = ["//visibility:public"],
)
