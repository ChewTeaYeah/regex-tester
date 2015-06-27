require 'bundler'
Bundler.setup :default
require 'sinatra/base'
require 'sprockets'
require 'uglifier'
require './app'

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