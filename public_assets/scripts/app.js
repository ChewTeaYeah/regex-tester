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
		$http.post('/test_expr', postData).then(function success(result){
			deferred.resolve(result.data);
		}, function error(response){
			deferred.reject(response);
		});

		return deferred.promise;
	};

	return svc;
}]);

app.controller('regexTesterController', ['$scope', 'regexTesterService', function($scope, regexTesterService){
	$scope.runTest = function(){
		regexTesterService.testExpr($scope.regex, $scope.regexOpts, $scope.testString).then(function success(result){
			$scope.testResult = JSON.stringify(result);
		}, function error(response){
			$scope.testResult = JSON.stringify(response.data);
		});
	};
}]);