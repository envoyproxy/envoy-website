require "find"
require "listen"
require "set"

require "jekyll-watch"

module Jekyll
  module Watcher
    def build_listener_with_symlinks(site, options)
      src = options["source"]

      # Find the realpath of the `_config.yml` file
      root = File.dirname(File.readlink(src + "/_config.yml"))

      # Only monitor the jekyll assets, lest it burns out your CPU
      dirs = [root + "/_includes", root + "/_data", root + "/_sass"]

      # ignore the sass vendor files
      ignore_paths = listen_ignore_paths(options) + [/vendor/]
      #  + [/^bazel/, /^_site/, /^\.jekyll/, /^docs\/envoy/, /^node_modules/, /^.git/]

      Listen.to(
        *dirs,
        :ignore => ignore_paths,
        :force_polling => options['force_polling'],
        &(listen_handler(site))
      )
    end

    alias_method :build_listener_without_symlinks, :build_listener
    alias_method :build_listener, :build_listener_with_symlinks
  end
end
