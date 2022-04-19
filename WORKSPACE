
workspace(
    name = "envoy-website",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# This should match the version in `.ruby-version`
# It must also be availble, and preferably the default here:
#  https://github.com/netlify/build-image/blob/focal/included_software.md
RUBY_VERSION = "2.7.2"
RUBY_BUNDLER_VERSION = "2.3.11"

PYTHON_VERSION = "3.10"

git_repository(
    name = "bazelruby_rules_ruby",
    remote = "https://github.com/bazelruby/rules_ruby.git",
    branch = "master"
)

http_archive(
    name = "rules_pkg",
    url = "https://github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
    sha256 = "62eeb544ff1ef41d786e329e1536c1d541bb9bcad27ae984d57f18f314018e66",
)

rules_python_version = "ae9f24ff7cd208af1b895c7509762caaf3b651e0"
http_archive(
    name = "rules_python",
    sha256 = "2a5cf996de8d5f6b736005b09a31f774242dd7506bcc1a5ec256946a825d175c",
    strip_prefix = "rules_python-{}".format(rules_python_version),
    url = "https://github.com/bazelbuild/rules_python/archive/{}.tar.gz".format(rules_python_version),
)

# Packaging

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")
rules_pkg_dependencies()

# Ruby toolchain and bundle

load(
    "@bazelruby_rules_ruby//ruby:deps.bzl",
    "rules_ruby_dependencies",
    "rules_ruby_select_sdk",
)

rules_ruby_dependencies()

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")
bazel_skylib_workspace()

rules_ruby_select_sdk(version = RUBY_VERSION)

load("@bazelruby_rules_ruby//ruby:defs.bzl", "ruby_bundle")

ruby_bundle(
    name = "jekyll_bundle",
    bundler_version = RUBY_BUNDLER_VERSION,
    gemfile = "//site:Gemfile",
    gemfile_lock = "//site:Gemfile.lock",
    vendor_cache = True,
)

# Python toolchain and pipset

load("@rules_python//python:repositories.bzl", "python_register_toolchains")

python_register_toolchains(
    name = "python3",
    python_version = PYTHON_VERSION,
)

load("@python3//:defs.bzl", "interpreter")
load("@rules_python//python:pip.bzl", "pip_parse")

pip_parse(
    name = "docs_pip3",
    requirements_lock = "@envoy-website//docs:requirements.txt",
    extra_pip_args = ["--require-hashes"],
    python_interpreter_target = interpreter,
)

load("@docs_pip3//:requirements.bzl", "install_deps")

install_deps()
