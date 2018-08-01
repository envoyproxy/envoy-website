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

### Deploying to Github Pages

To deploy your changes all you have to do is push to `master` and Github pages will automatically run `jekyll build` and
deploy the generated files.

### Site content

Item | Path
:----|:----
Home page content | [`_data/home.yml`](./_data/home.yml)
Nav links on the main page | [`_data/nav.yml`](./_data/nav.yml)
Blog posts | [`_posts`](./_posts)
Documentation (auto-generated) | [`docs`](./docs)

### Creating New Pages

To create a new page, all you need to do is create a new file in the root directory. This file can be either a Markdown
file or an HTML file.

The new file should contain what Jekyll calls [front matter](https://jekyllrb.com/docs/frontmatter/), which is essentially
YAML markup that lets you set options like the template, the permalink, and the title of the page.

### Creating Blog Posts

To create a new blog post, all you need to do is create a file in the `_posts` directory. How you name files in this folder is
important. Jekyll requires blog post files to be named according to the following format:

```
YEAR-MONTH-DAY-title.MARKUP
```

Where `YEAR` is a four-digit number, `MONTH` and `DAY` are both two-digit numbers, and `MARKUP` is the file extension
representing the format used in the file. The following are examples of valid post filenames:

```
2011-12-31-new-years-eve-is-awesome.md
2012-09-12-how-to-write-a-blog.md
```