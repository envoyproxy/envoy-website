load("//:versions.bzl", "VERSIONS")

genrule(
    name = "bootstrap",
    cmd = """curl -Ls https://github.com/twbs/bootstrap/archive/refs/tags/v%s.tar.gz > $@""" % VERSIONS["bootstrap"]["version"],
    outs = ["bootstrap.tar.gz"],
    visibility = ["//visibility:public"],
)
