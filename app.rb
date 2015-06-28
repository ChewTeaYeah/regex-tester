# This program is free software. It comes without any warranty, to
# the extent permitted by applicable law. You can redistribute it
# and/or modify it under the terms of the Do What The Fuck You Want
# To Public License, Version 2, as published by Sam Hocevar. See
# http://www.wtfpl.net/ or the COPYING file for more details.

require 'sinatra/base'
require 'json'

class RegexTesterApp < Sinatra::Application
	set :show_exceptions, false # turns off the HTML response to exceptions in dev mode

	# generic error handler for uncaught exceptions
	error do
		content_type :json
		status 500

		{"error" => "Sorry, an error occurred processing your request"}.to_json
	end

	# error handler for Regexp errors
	error RegexpError do
		content_type :json
		status 422 # unprocessable entity

		err = env['sinatra.error']

		{"error" => err.message}.to_json
	end

	# serve the frontend
	get '/' do
		send_file File.expand_path('index.html', settings.public_folder)
	end

	# tests a regular expression against a string
	# params: regex, regex_options, test_string
	post '/test_expr' do	
		request.body.rewind
		reqData = JSON.parse(request.body.read)

		regex_string = reqData["regex"]
		regex_options = reqData["regex_options"]
		test_string = reqData["test_string"]

		content_type :json

		if (regex_string == nil or regex_string =~ /\A\s+\z/ or test_string == nil or test_string =~ /\A\s+\z/)
			status 400
			return {"error" => "Invalid parameters"}.to_json
		end

		matches = test_regexpr(regex_string, regex_options, test_string)

		matches.to_json
	end

	def test_regexpr(regex_string, regex_options, test_string)
		regex_options = parse_regex_options(regex_options)

		regex = Regexp.new(regex_string, regex_options)

		matches = Hash.new
		matches["capture_groups"] = Array.new
		matches["match_data"] = Array.new

		test_string.scan(regex) do
			current_group_captures = Array.new

			match = Regexp.last_match
			matched_string = match[0]
			
			match_data = Hash.new
			match_data["matched_string"] = matched_string
			match_data["begin"] = match.begin(0)
			match_data["end"] = match.end(0)

			matches["match_data"] << match_data

			num_matches = match.length
			i = 1

			while (i < num_matches)
				current_group_captures << match[i]
				i += 1
			end

			if (current_group_captures.length > 0)
				matches["capture_groups"] << current_group_captures
			end
		end

		matches
	end

	def parse_regex_options(regex_options)
		opts = 0

		if (regex_options =~ /i/i)
			opts |= Regexp::IGNORECASE
		end

		if (regex_options =~ /x/i)
			opts |= Regexp::EXTENDED
		end

		if (regex_options =~ /m/i)
			opts |= Regexp::MULTILINE
		end

		opts
	end
end