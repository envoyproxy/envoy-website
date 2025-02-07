# Envoy website

This is the repo for the [Envoy website](https://www.envoyproxy.io).

The website is built with bazel using Pelican and Sphinx.

The site is deployed to Netlify.

Envoy's documentation for release versions is stored in https://github.com/envoyproxy/archive/.


## Contribute content to the website

### Site data

Site data is stored (or created) in yaml files in the [site/data](./site/data)  directory.

### Add adopter logo

Envoy is happy to recognize projects that use the software in production.

These are not intended to be an advertisement, but a show of support for the project.

All supporting organizations will be listed in alphabetical order.

To be added to our adopter list, you must meet at least 2 of these criteria:

*   Be a participant and active contributor in the community, eg:
    - contributing code
    - raising or resolving issues
    - sponsoring EnvoyCon
*   Publicly disclose your usage of Envoy, eg:
    - [talk](https://www.youtube.com/watch?v=4x5WjxAMvKY)
    - [blog](https://monzo.com/blog/2019/04/03/deploying-envoy-proxy)
    - [CNCF case study](https://www.cncf.io/newsroom/case-studies/?_sft_cstudies_project=envoy)
    - [social media](https://twitter.com/suhailpatel/status/1113425967144476672)
*   Have an existing Envoy maintainer vouch for and approve your pull request

To add your logo, please send a [pull request](https://github.com/envoyproxy/envoy-website/pulls).


## Envoy website development

Sphinx is used to build the latest docs, and Pelican is used to assemble the static files into a site.

The build process is **managed by bazel** to ensure reproducible builds and manage external data.

All content, data and customizations are stored in the [site directory](https://github.com/envoyproxy/envoy-website/tree/main/site)

### Build using Docker

**This is the recommended way to build the site.**

The [composition](docker-compose.yml) is designed to make use of a Bazel cache on your host system.

#### Docker: export your `UID`

By default Docker cannot see your user's `UID`, so you need to export it to run the container build.

This ensures that any files created inside the container - the site build and any cache files - are owned
by the host user.

```console
$ export UID
```

#### Docker: build the website

```console
$ docker compose up --build -d website
```

This will take some time on first run - you can tail the logs with:

```console
$ docker compose logs -f
```

Once the build has completed the website should be available at http://localhost:8000.

If you are not running the [automatic rebuild](#automatically-rebuild-during-development) and you make changes you can rebuild the site with:

```console
$ docker compose run build
```

### Build the site on your host machine

If you would prefer not to use Docker you can build directly on your host machine.

#### Host: install bazel

The expected version of Bazel can be seen in [.bazelversion](.bazelversion).

It is [recommended to install Bazel with Bazelisk](https://bazel.build/install/bazelisk) as this will pull in the
correct Bazel version.

If you have Yarn installed you can install Bazelisk with that.

From inside your local copy of the envoy-website repository, run:

```console
$ yarn install .
```

#### Host: install a compiler

You will need a compiler (clang or GCC) and some related dev tools installed to **build the docs**.

For example, on a Debian-based system, these can be installed with:

```console
$ apt get install build-essential
```

If you [build without the docs](#build-without-the-docs), you can ignore this requirement.

#### Host: build the website

```console
$ ./build-website.sh
```

### Tips for site development

#### Automatically rebuild during development

The site can be made to auto-rebuild when changes occur in the `site/` directory.

If you are using Docker you can trigger this by setting the following in your environment,
before bringing up the Docker composition:

```console
$ export BUILDER=live
$ docker compose up --build -d website
```

If you are building on your host you can just run the rebuild script directly:

```console
$ ./rebuild.sh ./site ./build-website.sh
```

#### Build without the docs

If you only need the non-docs parts of the website to be built, set the following environment
variable.

Set this before building in Docker **or** on your host:

```console
$ export BAZEL_BUILD_OPTIONS="--config=nodocs"
```

#### Debug build

You can enable richer logging.

Set the following environment variable before building in Docker **or** on your host:

```console
$ export DEBUG=1
```

#### Put frequently used env vars in `.env`

Docker compose will source the `.env` file before running.

For example, if you always want the site to build "live", add the following to `.env`

```sh
export BUILDER=live
```
