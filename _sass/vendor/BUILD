load("//:versions.bzl", "VERSIONS")

genrule(
    name = "bootstrap",
    cmd = """\
    TEMPDIR=$$(mktemp -d) \
    && tar xzf $(location //assets:bootstrap) -C $$TEMPDIR bootstrap-%s/scss \
    && mkdir -p $$TEMPDIR/out/_sass/vendor \
    && mv $$TEMPDIR/bootstrap-%s/scss $$TEMPDIR/out/_sass/vendor/bootstrap \
    && tar czf $@ -C $$TEMPDIR/out . \
    && rm -rf $$TEMPDIR
    """ % (VERSIONS["bootstrap"]["version"], VERSIONS["bootstrap"]["version"]),
    tools = ["//assets:bootstrap"],
    outs = ["bootstrap.tar.gz"],
    visibility = ["//visibility:public"],
)
