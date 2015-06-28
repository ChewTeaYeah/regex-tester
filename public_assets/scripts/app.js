/*
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ or the COPYING file for more details. 
 */

var app = angular.module('regexTester', ['ui.bootstrap']);

app.service('regexTesterService', ['$q', '$http', function($q, $http){
	var svc = {};

	svc.testExpr = function(regexStr, regexOpts, testString){
		var postData = {
			regex: regexStr,
			regex_options: regexOpts,
			test_string: testString
		};

		var deferred = $q.defer();
		$http.post('test_expr', postData).then(function success(result){
			deferred.resolve(result.data);
		}, function error(response){
			deferred.reject(response);
		});

		return deferred.promise;
	};

	return svc;
}]);

app.controller('regexTesterController', ['$scope', '$sce', 'regexTesterService', function($scope, $sce, regexTesterService){
	$scope.regex = "";
	$scope.regexOptsText = "";
	$scope.testString = "";
	$scope.matchedStringData = [];
	$scope.regexError = "";

	var addTextToMatchData = function(text, highlight){
		if (angular.isString(text)){
			text = $sce.trustAsHtml(text.replace(/\n/g, '<br>'));
		}

		$scope.matchedStringData.push({
			text: text,
			highlight: highlight
		});
	}

	var runTest = function(){
		if (!angular.isString($scope.regex) || $scope.regex.length === 0 
			|| !angular.isString($scope.testString) || $scope.testString.length === 0){
			$scope.testResult = "";
			$scope.matchedStringData = [];
			if (angular.isString($scope.regex) && $scope.regex.length === 0){
				$scope.regexError = "";
			}

			return;
		}

		regexTesterService.testExpr($scope.regex, $scope.regexOptsText, $scope.testString).then(function success(result){
			$scope.testResult = result;
			$scope.matchedStringData = [];
			var lastEnd = 0;

			angular.forEach($scope.testResult.match_data, function(item){
				if (angular.isNumber(lastEnd) && angular.isNumber(item.begin) && lastEnd !== item.begin){
					var text = $scope.testString.substring(lastEnd, item.begin);

					addTextToMatchData(text, false);
				}

				addTextToMatchData(item.matched_string, true);

				lastEnd = item.end;
			});

			if (lastEnd < $scope.testString.length){
				addTextToMatchData($scope.testString.substring(lastEnd, $scope.testString.length), false);
			}

			$scope.regexError = "";
		}, function error(response){
			$scope.testResult = "";
			$scope.matchedStringData = [];
			if (response.status === 422){
				$scope.regexError = response.data.error;
			}
		});
	};

	$scope.getMatchDisplayStyle = function(match){
		if (match.highlight){
			return {
				'margin-right': '1px',
				'background-color': '#ACCEF7'
			};
		}

		return {};
	};

	$scope.regexOptions = {
		i: false,
		m: false,
		x: false
	};

	$scope.$watchCollection('regexOptions', function(newVal, oldVal){
		angular.forEach($scope.regexOptions, function(value, key){
			if (value){
				var re = new RegExp(key);
				if (!re.test($scope.regexOptsText)){
					$scope.regexOptsText += key;
				}
			} else {
				$scope.regexOptsText = $scope.regexOptsText.replace(key, "");
			}
		});
	});

	$scope.$watchGroup(['regex', 'regexOptsText', 'testString'], function(newVals, oldVals){
		if (newVals[0] !== oldVals[0] || newVals[1] !== oldVals[1] || newVals[2] !== oldVals[2]){
			runTest();
		}
	});

	var validOptsRegex = /^(m?i?x?|i?m?x?|m?x?i?|i?x?m?|x?m?i?|x?i?m?)$/;
	var isValidRegexOptString = function(str){
		return (angular.isString(str) && str.length <= 3 && validOptsRegex.test(str));
	};

	$scope.$watch('regexOptsText', function(newVal, oldVal){
		if (newVal !== oldVal && angular.isString(newVal)){
			if (isValidRegexOptString(newVal)){
				$scope.regexOptsText = newVal.toLowerCase();
			} else {
				$scope.regexOptsText = oldVal;
			}

			angular.forEach($scope.regexOptions, function(value, key){
				var re = new RegExp(key, "i");

				if (re.test($scope.regexOptsText)){
					$scope.regexOptions[key] = true;
				} else {
					$scope.regexOptions[key] = false;
				}
			});
		}
	});
}]);