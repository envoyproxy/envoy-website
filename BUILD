load("@envoy_toolshed//:macros.bzl", "json_data")
load("//:versions.bzl", "VERSIONS")
load("@aspect_bazel_lib//lib:jq.bzl", "jq")

exports_files([
    "versions.bzl",
])

filegroup(
    name = "jekyll_assets",
    srcs = glob([
        "_includes/*",
        "_layouts/**/*",
        "_sass/**/*",
    ]) + [":_config.yml", "//_data:assets"],
    visibility = ["//visibility:public"],
)

filegroup(
    name = "website_assets",
    srcs = glob([
        "css/*",
        "img/**/*",
        "try/*",
        ]) + [
        ":404.html",
        ":community.html",
        ":docs.md",
        ":google95e577d28834e13d.html",
        ":google7933de1bd04e097b.html",
        ":index.html",
        ":robots.txt",
        ":training.html",
    ],
    visibility = ["//visibility:public"],
)

json_data(
    name = "deps",
    data = VERSIONS,
)

jq(
    name = "dependency_versions",
    srcs = [":deps"],
    out = "dependency_shas.json",
    filter = """
    with_entries(select(.value | objects and .type == "github_archive") | .value |= {repo, sha256, url, version})
    """,
    visibility = ["//visibility:public"],
)
