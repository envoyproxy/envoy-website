load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")
load("@bazelruby_rules_ruby//ruby:deps.bzl", "rules_ruby_dependencies")

def load_dependencies():
    rules_pkg_dependencies()
    rules_ruby_dependencies()
