# Bzlmod Migration

This repository has been migrated from WORKSPACE-based Bazel to use Bzlmod (MODULE.bazel).

## Overview

Bzlmod is Bazel's modern dependency management system that provides better version resolution,
dependency isolation, and reproducibility compared to the legacy WORKSPACE approach.

## What Changed

### Files Added
- **MODULE.bazel**: Main bzlmod configuration file that declares dependencies and their versions
- **WORKSPACE.bzlmod**: Supplements MODULE.bazel for dependencies that need WORKSPACE mode (envoy, envoy_archive, bootstrap)

### Files Removed
- **WORKSPACE**: Legacy dependency configuration (removed entirely as nothing depends on this repo)
- **archive.bzl**: Moved to WORKSPACE.bzlmod
- **toolchains.bzl**: Toolchain setup now in MODULE.bazel
- **packages.bzl**: Package setup now in MODULE.bazel
- **deps.bzl**: Replaced by WORKSPACE.bzlmod approach

### Files Modified
- **.bazelrc**: Changed `--noenable_bzlmod` to `--enable_bzlmod`
- **versions.bzl**: Still used for version tracking but now consumed by deps.bzl

## Dependencies

### Standard Bzlmod Dependencies

These are declared with `bazel_dep()` in MODULE.bazel:
- `aspect_bazel_lib` - Bazel library with utilities
- `bazel_skylib` - Bazel standard library
- `rules_pkg` - Package rules for creating archives
- `rules_python` - Python rules and toolchain

### Archive Override

These use `archive_override` since they're not in BCR yet but have MODULE.bazel:

- `envoy_toolshed` - Website building macros and utilities
- `envoy` - For documentation building. Applies patch to remove `local_path_override` directives. Envoy's MODULE.bazel declares its own dependencies (zstd, zlib, toolchains_llvm, etc.) which are resolved from BCR.

### WORKSPACE.bzlmod Dependencies

These use WORKSPACE.bzlmod because they don't have MODULE.bazel or need custom BUILD files:

- **envoy_archive**: Has no MODULE.bazel
- **com_github_twbs_bootstrap**: Needs a custom BUILD file

## Pure Bzlmod Approach with archive_override

This migration uses a pure bzlmod approach for all dependencies with MODULE.bazel:

- **MODULE.bazel**: Handles all bzlmod dependencies (rules, toolchains, toolshed, envoy)
- **WORKSPACE.bzlmod**: Only for repositories without MODULE.bazel (envoy_archive, bootstrap)

### Loading envoy as a bzlmod Dependency

Envoy is loaded using `archive_override` in MODULE.bazel, not via `http_archive` in WORKSPACE.bzlmod. This is crucial because:

1. **MODULE.bazel is processed**: When loaded via `archive_override`, envoy's MODULE.bazel is processed as part of the bzlmod dependency graph
2. **Envoy declares its own dependencies**: Envoy's MODULE.bazel declares dependencies like zstd, zlib, toolchains_llvm, etc., which are resolved from the Bazel Central Registry
3. **Proper extension usage**: Extensions like `toolchains_llvm` work correctly because envoy is a proper bzlmod module in the dependency graph
4. **Avoids hybrid issues**: No need to manually declare envoy's dependencies in our MODULE.bazel

### Patching envoy's MODULE.bazel

Envoy's MODULE.bazel contains `local_path_override` directives for envoy_api, envoy_build_config, and envoy_mobile. These directives reference local paths within the envoy repository (like `path = "api"`) which don't exist when envoy is used as an external dependency.

We apply a patch that removes these `local_path_override` directives while keeping the rest of MODULE.bazel intact. This allows envoy to work properly in pure bzlmod mode with its dependencies properly declared and resolved.

## Python Setup

Python toolchain and pip dependencies are configured using bzlmod extensions:

```python
python = use_extension("@rules_python//python/extensions:python.bzl", "python")
python.toolchain(python_version = "3.10", is_default = True)

pip = use_extension("@rules_python//python/extensions:pip.bzl", "pip")
pip.parse(hub_name = "website_pip3", python_version = "3.10", requirements_lock = "//site:requirements.txt")
```

## Version Management

The `versions.bzl` file continues to be the source of truth for dependency versions. The `deps.bzl`
module extension reads from this file to load dependencies. This maintains compatibility with
existing version update scripts.

## Transitive Dependencies

With bzlmod, transitive dependencies are automatically discovered and resolved. For example:
- `zstd` comes transitively from `envoy`
- Other common dependencies come from `envoy_toolshed`

## Benefits

1. **Simpler dependency management**: No need for complex WORKSPACE macros
2. **Better version resolution**: Bazel handles version conflicts automatically
3. **Faster builds**: Improved caching and dependency resolution
4. **Future-proof**: WORKSPACE is being deprecated in favor of bzlmod
5. **End-of-line repo**: Since nothing builds from this repo, we can use bzlmod without worrying about downstream consumers

## Building

The build process remains the same:

```bash
bazel build //site
```

The only difference is that `--enable_bzlmod` is now set in .bazelrc by default.
