# Envoy Proxy Website

This is the repo for the Envoy Proxy website. This website uses Jekyll to generate static html files, and then deploys
the files on Github pages.

### Running the site locally

To run the website locally, first make sure you have Ruby 2.1.0 or higher installed.

1. Install the [`bundler`](https://bundler.io/) gem if it's not already installed:

```shell
gem install bundler
```

2. Install Jekyll and other dependencies defined in the Gemfile:

```shell
bundle install --path vendor/bundle
```

3. Run your Jekyll site locally:

```shell
bundle exec jekyll serve --livereload
```

4. Preview the site in your web browser at http://localhost:4000.

### Running the site locally using Docker

To run the website locally using Docker, run the command:

```shell
docker run -it -v $(pwd):/srv/jekyll -p 4000:4000 jekyll/jekyll jekyll serve --watch --incremental
```

Alternatively, use Docker Compose with:

```shell
docker-compose up
```

Preview the site in your web browser at http://localhost:4000.

### Deploying to Github Pages

To deploy your changes all you have to do is push to `master` and Github pages will automatically run `jekyll build` and
deploy the generated files.

### Site content

Item | Path
:----|:----
Home page content | [`_data/home.yml`](./_data/home.yml)
Nav links on the main page | [`_data/nav.yml`](./_data/nav.yml)
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
