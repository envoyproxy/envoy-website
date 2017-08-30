# Envoy Proxy Website

This is the repo for the Envoy Proxy website. This website uses Jekyll to generate static html files, and then deploys
the files on Github pages.

### Running the site locally
To run the website locally, first make sure you have Ruby 2.1.0 or higher installed.

1. If you don't have it already installed, install the Bundler gem:
```
gem install bundler
```
2. Install Jekyll and other dependencies defined in the Gemfile:
```
bundle install
```
3. Run your Jekyll site locally:
```
bundle exec jekyll serve
```
4. Preview the site in your web browser at `http://127.0.0.1:4000/`

### Deploying to Github Pages
To deploy your changes all you have to do is push to master and Github pages will run `jekyll build` and deploy the
files. Be sure you don't check in your local _site directory.

### Home Page Content
The content for the homepage can be found in the home.yml file in the _data directory.

### Nav Links
The links for the nav can be found in the nav.yml file in the _data directory.

### Creating New Pages
To create a new page, all you need to do is create a new file in the root directory. This file can be either a markdown
file or an html file.

The new file should contain what Jekyll calls Front Matter, which is essentially YAML markup that lets you set options
like the template, the permalink, and the title of the page.

### Creating Post Files
To create a new post, all you need to do is create a file in the _posts directory. How you name files in this folder is
important. Jekyll requires blog post files to be named according to the following format:

```
YEAR-MONTH-DAY-title.MARKUP
```

Where YEAR is a four-digit number, MONTH and DAY are both two-digit numbers, and MARKUP is the file extension
representing the format used in the file. For example, the following are examples of valid post filenames:

```
2011-12-31-new-years-eve-is-awesome.md
2012-09-12-how-to-write-a-blog.md
```