
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
        ":404.html",
        ":CNAME",
        ":community.html",
        ":docs.md",
        ":google7933de1bd04e097b.html",
        ":index.html",
        ":robots.txt",
        ":training.html",
    ],
    visibility = ["//visibility:public"],
)
