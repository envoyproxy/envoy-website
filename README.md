# Envoy Proxy Website

This is the repo for the [Envoy Proxy](https://www.envoyproxy.io) website.

This website is built using Jekyll and Sphinx to generate static html files, which are then deployed
with netlify.

### Using Bazel on your host development system

If you have Bazel installed on your host system you can use that to manage and develop
the site directly.

The expected version of Bazel can be seen in [.bazelversion](.bazelversion).

If you use Bazel directly on your host, you will need some minimum system requirements. These
requirements can be seen for a Ubuntu-based system in the provided [Dockerfile](docker/Dockerfile).

### Using Bazel in a Docker container

You can also run the necessary Bazel commands inside a Docker container.

A [docker-compose](docker-compose.yml) file has been provided for your convenience, which uses a [Docker image](docker/Dockerfile) containing the system requirements expected by bazel.

The [composition](docker-compose.yml) is designed to make use of the bazel cache on your host system.

You may need to export the `UID` of your user to run the container.

```console
$ export UID
```

### The bazel Ruby toolchain

As Ruby is required to build the website, a ruby toolchain is included in the bazel rules.

This will look for any available Ruby binaries in its environment.

If it finds a version matching the one specified in [.ruby-version](.ruby-version) it will use that one.

Otherwise, it will compile the required Ruby version, caching the binary for further use.

If you run Bazel commands inside a Docker container it will need to compile Ruby unless it finds a previously compiled and cached version.

### Running the live site locally (Bazel)

```console
$ bazel run //site:live
```

The site should now be available by visiting http://localhost:4000.

By default only the website and not the documentation is served by this environment.

You can view the entire site, built with the latest documentation, with the following:

```console
$ export ENVOY_COMMIT="$(bazel run //docs:latest_version)"
$ bazel run --action_env=ENVOY_COMMIT //site:live_docs
```

### Running the site locally (Docker)

You can run the website inside a Docker container with the provided [compose recipe](docker-compose.yml).

```console
$ docker-compose up live
```

By default only the website and not the documentation is served by this environment.

You can view the entire site, built with the latest documentation, with the following:

```console
$ docker-compose up live_docs
```

### Building the site locally (Bazel)

The Bazel target to build the entire website is:

```console
$ export ENVOY_COMMIT="$(bazel run //docs:latest_version)"
$ bazel build --action_env=ENVOY_COMMIT //site:html
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

### Running Bazel commands inside a container.

To drop into a Docker container, with the port mappings configured in the [composition](docker-compose.yml) file:

```console
$ docker-compose run -p 4000:4000 live bash
```

From there you can run bazel commands directly, for example:

```console

username@73deecbfaf55:/src/workspace/envoy-website$ bazel run //docs:latest_version
...
b200312ddcbc4d237cd197a42cdd8c66cc8c6af0

```

### Site content

Item | Path
:----|:----
Home page content | [`_data/home.yml`](./_data/home.yml)
Nav links on the main page | [`_data/nav.yml`](./_data/nav.yml)
Documentation versions | [`_data/versions.yaml`](./_data/versions.yml)
Documentation (auto-generated) | [`docs`](./docs)

### Creating New Pages

To create a new page, all you need to do is create a new file in the root directory. This file can be either a Markdown
file or an HTML file.

The new file should contain what Jekyll calls [front matter](https://jekyllrb.com/docs/frontmatter/), which is essentially
YAML markup that lets you set options like the template, the permalink, and the title of the page.

### Add Envoy Adopter Logo

Envoy is happy to recognize projects that use the software in production. These are not intended to be an advertisement, but a show of support for the project. All supporting organizations will be listed in alphabetical order. To be added to our adopter list, you must meet these criteria:

*   Be a participant and active contributor in the community, this can be contributing code, issues or sponsoring EnvoyCon
*   Publicly disclose your usage of Envoy via a [talk](https://www.youtube.com/watch?v=4x5WjxAMvKY), [blog](https://monzo.com/blog/2019/04/03/deploying-envoy-proxy) [CNCF case study](https://www.cncf.io/newsroom/case-studies/?_sft_cstudies_project=envoy) or [social media](https://twitter.com/suhailpatel/status/1113425967144476672)
*   Submit a high quality grayscale vector SVG logo, we scale the height to 52px (see [example](https://d33wubrfki0l68.cloudfront.net/c814eec20d8e4de39697c7b5790284babe86b248/d1091/img/logos/lyft.svg))
*   Have an existing Envoy maintainer vouch for and approve your pull request

To add your logo, please send a [pull request](https://github.com/envoyproxy/envoy-website) (see this as an [example](https://github.com/envoyproxy/envoy-website/pull/102)).

### The Envoy blog

The official Envoy blog is hosted on [Medium](https://medium.com) at https://blog.envoyproxy.io.
