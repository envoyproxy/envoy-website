

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
        $(locations //docs:releases_inventories) "" \
        > $@
    """,
    outs = ["versions.yml"],
    tools = [
        "//tools/versions:release_versions",
        "//docs:releases_inventories",
    ],
    visibility = ["//visibility:public"],
)
