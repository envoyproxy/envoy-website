
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
        "assets/**/*",
        "css/*",
        "img/**/*",
        "try/*",
        ]) + [
        ":community.html",
        ":docs.md",
        ":index.html",
        ":robots.txt",
        ":training.html",
    ],
    visibility = ["//visibility:public"],
)
