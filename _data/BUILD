

filegroup(
    name = "assets",
    srcs = glob([
        "*",
    ]),
    visibility = ["//visibility:public"],
)

genrule(
    name = "versions",
    cmd = """
    $(location //tools/versions:release_versions) \
        $(location //docs:releases_html) "" \
        > $@
    """,
    outs = ["versions.yml"],
    tools = [
        "//tools/versions:release_versions",
        "//docs:releases_html",
    ],
    visibility = ["//visibility:public"],
)
