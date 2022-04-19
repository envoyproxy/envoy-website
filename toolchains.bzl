load("@bazelruby_rules_ruby//ruby:deps.bzl", "rules_ruby_select_sdk")
load("@rules_python//python:repositories.bzl", "python_register_toolchains")
load("//:versions.bzl", "VERSIONS")

def load_toolchains():
    rules_ruby_select_sdk(version = VERSIONS["ruby"])
    python_register_toolchains(
        name = "python3",
        python_version = VERSIONS["python"],
    )
