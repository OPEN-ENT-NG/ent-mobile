(function () {
	'use strict';

	angular.module('angular.img', [
	]).directive('httpSrc', ['$http', function ($http) {
		return {
			link: function ($scope, elem, attrs) {
				function revokeObjectURL() {
					if ($scope.objectURL) {
						URL.revokeObjectURL($scope.objectURL);
					}
				}

				$scope.$watch('objectURL', function (objectURL) {
					elem.attr('src', objectURL);
				});

				$scope.$on('$destroy', function () {
					revokeObjectURL();
				});

				attrs.$observe('httpSrc', function (url) {
					revokeObjectURL();

					if(url && url.indexOf('data:') === 0) {
						$scope.objectURL = url;
					} else if(url) {
						$http.get(url, { responseType: 'arraybuffer' })
							.then(function (response) {
								var blob = new Blob(
									[ response.data ],
									{ type: response.headers('Content-Type') }
								);
								$scope.objectURL = URL.createObjectURL(blob);
							});
					}
				});
			}
		};
	}]);
}());
// (function() {
//     'use strict';
//
//     angular.module('angular.img', []).directive('httpSrc', [
//         '$http',
//         function($http) {
//             var directive = {
//                 link: link,
//                 restrict: 'A'
//             };
//             return directive;
//
//             function link(scope, element, attrs) {
//                 var requestConfig = {
//                     method: 'Get',
//                     url: attrs.httpSrc,
//                     responseType: 'arraybuffer',
//                     cache: 'true'
//                 };
//
//                 $http(requestConfig)
//                     .then(function(res) {
//                         var data = res.data;
//                         var arr = new Uint8Array(data);
//
//                         var raw = '';
//                         var i, j, subArray, chunk = 5000;
//                         for (i = 0, j = arr.length; i < j; i += chunk) {
//                             subArray = arr.subarray(i, i + chunk);
//                             raw += String.fromCharCode.apply(null, subArray);
//                         }
//
//                         var b64 = btoa(raw);
//                         var minetype = res.headers('Content-Type');//image/png;
//                         var img = "data:"+minetype+";base64," + b64;
//                         attrs.$set('src', img);
//                     });
//             }
//
//         }
//     ]);
// }());
