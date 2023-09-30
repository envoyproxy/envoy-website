load("@envoy_toolshed//website:macros.bzl", "website_theme")

exports_files(["index.html"])

website_theme(
    name = "theme",
    css = "//site/theme/css",
    home = ":index.html",
    images_extra = "//site/theme/images",
    js = "//site/theme/js",
    templates_extra = "//site/theme/templates",
)
