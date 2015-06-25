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

app.controller('regexTesterController', ['$scope', 'regexTesterService', function($scope, regexTesterService){
	$scope.regex = "";
	$scope.regexOptsText = "";
	$scope.testString = "";

	var runTest = function(){
		if (!angular.isString($scope.regex) || $scope.regex.length === 0 
			|| !angular.isString($scope.testString) || $scope.testString.length === 0){
			$scope.testResult = "";
			return;
		}

		regexTesterService.testExpr($scope.regex, $scope.regexOptsText, $scope.testString).then(function success(result){
			$scope.testResult = result;
		}, function error(response){
			$scope.testResult = JSON.stringify(response.data);
		});
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
			// TODO: augment this if statement to also ensure all chars in input are unique
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