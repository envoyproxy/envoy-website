load("@bazelruby_rules_ruby//ruby:defs.bzl", "ruby_bundle")
load("@python3//:defs.bzl", "interpreter")
load("@rules_python//python:pip.bzl", "pip_parse")
load("//:versions.bzl", "VERSIONS")

def load_packages():

    ruby_bundle(
        name = "jekyll_bundle",
        bundler_version = VERSIONS["ruby_bundler"],
        gemfile = "//site:Gemfile",
        gemfile_lock = "//site:Gemfile.lock",
        vendor_cache = True,
    )

    # Python toolchain and pipset

    pip_parse(
        name = "docs_pip3",
        requirements_lock = "@envoy-website//docs:requirements.txt",
        extra_pip_args = ["--require-hashes"],
        python_interpreter_target = interpreter,
    )
