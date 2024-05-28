# Envoy Proxy Website

This is the repo for the [Envoy Proxy](https://www.envoyproxy.io) website.

This website is built using Pelican and Sphinx, which are then deployed
with netlify. Sphinx is used to build the latest docs, and Pelican is used to assemble the
static files into a site.

Existing Envoy docs are stored in https://github.com/envoyproxy/archive/ and are pulled in as part of the
build process.

### Using Bazel on your host development system

If you have Bazel installed on your host system you can use that to manage and develop
the site directly.

The expected version of Bazel can be seen in [.bazelversion](.bazelversion).

It is recommended to use Bazelisk as this will pull in the correct Bazel version.

If you have Yarn installed you can install Bazelisk with:

```console
$ yarn install .
```

If you use Bazel directly on your host, you will need some minimum system requirements - a compiler and `jq`.

On a Debian-based system, these can be installed with:

```console
$ apt get install build-essential jq
```

### Using Bazel in a Docker container

You can also run the necessary Bazel commands inside a Docker container.

A [docker-compose](docker-compose.yml) file has been provided for your convenience, which uses a [Docker image](docker/Dockerfile) containing the system requirements expected by Bazel.

The [composition](docker-compose.yml) is designed to make use of the Bazel cache on your host system.

You may need to export the `UID` of your user to run the container.

```console
$ export UID
```

### Building the site locally (Bazel)

The Bazel target to build the entire website is:

```console
$ bazel build //:dependency_versions
$ export BUILD_DOCS_SHA="$(jq -r '.envoy.version' bazel-bin/dependency_shas.json)"
$ bazel build --action_env=BUILD_DOCS_SHA //site:html
```

There is a convenience script (as used in CI) that will build into a `_site` folder in the current
directory:

```console
$ ./build-website.sh
```

### Building the site locally (Docker)

The following command will build the entire website, including all documentation, into a `_site` folder in the current
directory:

```console
$ docker-compose run build
```

## Site build

The website is built using the `static_website` macro from https://github.com/envoyproxy/toolshed/blob/main/bazel/website.

All content, data and customizations are stored in the [site directory](https://github.com/envoyproxy/envoy-website/tree/main/site)

### Site data

Site data is stored (or created) in yaml files in the [site/data directory](./site/data)

For example, the nav links can be found in [`site/data/nav.yml`](./site/data/nav.yml)

### Add Envoy Adopter Logo

Envoy is happy to recognize projects that use the software in production. These are not intended to be an advertisement, but a
show of support for the project. All supporting organizations will be listed in alphabetical order.

To be added to our adopter list, you must meet these criteria:

*   Be a participant and active contributor in the community, this can be contributing code, issues or sponsoring EnvoyCon
*   Publicly disclose your usage of Envoy via a [talk](https://www.youtube.com/watch?v=4x5WjxAMvKY), [blog](https://monzo.com/blog/2019/04/03/deploying-envoy-proxy) [CNCF case study](https://www.cncf.io/newsroom/case-studies/?_sft_cstudies_project=envoy) or [social media](https://twitter.com/suhailpatel/status/1113425967144476672)
*   Submit a high quality grayscale vector SVG logo, we scale the height to 52px (see [example](https://d33wubrfki0l68.cloudfront.net/c814eec20d8e4de39697c7b5790284babe86b248/d1091/img/logos/lyft.svg))
*   Have an existing Envoy maintainer vouch for and approve your pull request

To add your logo, please send a [pull request](https://github.com/envoyproxy/envoy-website) (see this as an
[example](https://github.com/envoyproxy/envoy-website/pull/102)).

### The Envoy blog

The official Envoy blog is hosted on [Medium](https://medium.com) at https://blog.envoyproxy.io.
