
filegroup(
    name = "jekyll_assets",
    srcs = glob([
        "_data/*",
        "_includes/*",
        "_layouts/**/*",
        "_sass/**/*",
    ]) + [":_config.yml"],
    visibility = ["//visibility:public"],
)

filegroup(
    name = "website_assets",
    srcs = glob([
        "css/*",
        "img/**/*",
        "try/*",
        ]) + [
        ":community.html",
        ":index.html",
        ":training.html",
        ":docs.md",
    ],
    visibility = ["//visibility:public"],
)
