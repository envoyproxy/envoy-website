workspace(name = "envoy-website")

load(":archive.bzl", "load_archives")
load_archives()

load(":deps.bzl", "load_dependencies")
load_dependencies()

load(":toolchains.bzl", "load_toolchains")
load_toolchains()

load(":packages.bzl", "load_packages")
load_packages()

load("@docs_pip3//:requirements.bzl", "install_deps")
install_deps()
