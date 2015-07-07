require 'rubygems'
require 'bundler'
 
Bundler.require

ROOT = Pathname(File.dirname(__FILE__))

namespace :assets do
  task :compile do
    sprockets = Sprockets::Environment.new(ROOT) do |env|
      env.append_path 'public_assets'
      env.js_compressor = :uglify
    end

    assets = sprockets.find_asset("application.js")
    assets.write_to("./public/application.min.js")

    sprockets = Sprockets::Environment.new(ROOT) do |env|
      env.append_path 'vendor_assets'
      env.js_compressor = :uglify
    end

    assets = sprockets.find_asset("vendor.js")
    assets.write_to("./public/vendor.min.js")
  end
end