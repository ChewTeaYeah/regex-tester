require 'bundler'
Bundler.setup :default
require 'sinatra/base'
require 'sprockets'
require './app'

map '/assets' do
  environment = Sprockets::Environment.new RegexTesterApp.settings.root
  environment.append_path 'public_assets'
  environment.append_path 'vendor_assets'
  run environment
end

map '/' do
  run RegexTesterApp
end