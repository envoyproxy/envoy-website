load("//:versions.bzl", "VERSIONS")

genrule(
    name = "bootstrap.bundle",
    cmd = """\
    TEMPDIR=$$(mktemp -d) \
    && tar xzf $(location //assets:bootstrap) -C $$TEMPDIR bootstrap-%s/dist/js/bootstrap.bundle.min.js \
    && mv $$TEMPDIR/bootstrap-%s/dist/js/bootstrap.bundle.min.js $@ \
    && rm -rf $$TEMPDIR
    """ % (VERSIONS["bootstrap"]["version"], VERSIONS["bootstrap"]["version"]),
    tools = ["//assets:bootstrap"],
    outs = ["bootstrap.bundle.min.js"],
    visibility = ["//visibility:public"],
)
