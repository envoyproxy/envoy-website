
filegroup(
    name = "jekyll_assets",
    srcs = glob([
        "_includes/*",
        "_layouts/**/*",
        "_posts/**/*",
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
        ":blog.html",
        ":google7933de1bd04e097b.html",
        ":index.html",
        ":robots.txt",
        ":training.html",
    ],
    visibility = ["//visibility:public"],
)
