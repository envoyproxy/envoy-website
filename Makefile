JEKYLL = bundle exec jekyll

build:
	$(JEKYLL) build

serve:
	$(JEKYLL) serve

serve-reload:
	$(JEKYLL) serve --livereload