# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ or the COPYING file for more details.

require 'bundler'
Bundler.setup :default
require 'sinatra/base'
require 'sprockets'
require 'uglifier'
require 'rake'
require './app'

puts "Running assets:compile rake task"
Rake.load_rakefile 'Rakefile'
Rake::Task['assets:compile'].invoke

map '/assets' do
  environment = Sprockets::Environment.new RegexTesterApp.settings.root
  environment.append_path 'public_assets'
  environment.append_path 'vendor_assets'
  
  if (ENV['RACK_ENV'] == 'production')
  	environment.js_compressor = :uglifier
  end

  run environment
end

map '/' do
  run RegexTesterApp
end