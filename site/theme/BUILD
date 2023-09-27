load("@envoy_toolshed//website:macros.bzl", "website_theme")

exports_files(["index.html"])

website_theme(
    name = "theme",
    home = ":index.html",
    css = "//site/theme/css",
    js =  "//site/theme/js",
    images_extra = "//site/theme/images",
    templates_extra = "//site/theme/templates",
)
