angular.module('ent.controllers', [])

.factory('sessionInjector', [function (SessionService) {

  var sessionInjector = {
    request: function(config) {
      if (localStorage.getItem('access_token')) {
        config.headers['Authorization'] = 'Bearer '+localStorage.getItem('access_token')

      }
      return config;
    },

    responseError: function(res) {
      //    alert('besoin de refreshToken');
      return res;
    }
  };
  return sessionInjector;
}])

.config(function($httpProvider) {
  $httpProvider.interceptors.push('sessionInjector');
  $httpProvider.defaults.withCredentials = true;
})

.controller('UserInfoCtrl', function($scope, $http) {
  $http.get('https://recette-leo.entcore.org/auth/oauth2/userinfo').then(function(resp) {
    $scope.userinfo = resp.data;
  }, function(err) {
    alert('ERR', err.data.status);
  })
})

.controller('AppCtrl', function($scope, $sce, $state, $sanitize, $cordovaInAppBrowser){

  $scope.renderHtml = function(text){
    text = text.replace(/="\/workspace/g, "=\"https://recette-leo.entcore.org/workspace");

    var regex = /href="([\S]+)"/g;
    var newString = $sanitize(text).replace(regex, "onClick=\"windowref = window.open('$1', '_blank', 'location=no')\"");


    return $sce.trustAsHtml(newString);
  }

  $scope.logout = function(){
    localStorage.clear();
    $state.go("login");
  }
})


// function downloadFile() {
//   var url = "http://your_ip_address/images/my.jpg";
//   var filename = url.split("/").pop();
//   alert(filename);
//   var targetPath = cordova.file.externalRootDirectory + filename;
//   var trustHosts = true
//   var options = {};
//   alert(cordova.file.externalRootDirectory);
//   $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
//   .then(function(result) {
//     // Success!
//     alert(JSON.stringify(result));
//   }, function(error) {
//     // Error
//     alert(JSON.stringify(error));
//   }, function (progress) {
//     $timeout(function () {
//       $scope.downloadProgress = (progress.loaded / progress.total) * 100;
//     })
//   });
// }
//
// function getExtention(url){
//   var windowref = window.open(url, '_blank', 'location=no');
//   windowref.addEventListener('loadstart', function(e) {
//     var url = e.url;
//     var extension = url.substr(url.length - 4);
//     if (extension == '.pdf') {
//       var targetPath = cordova.file.documentsDirectory + "receipt.pdf";
//       var options = {};
//       var args = {
//         url: url,
//         targetPath: targetPath,
//         options: options
//       };
//       windowref.close(); // close window or you get exception
//       document.addEventListener('deviceready', function () {
//         $timeout(function() {
//           downloadReceipt(args); // call the function which will download the file 1s after the window is closed, just in case..
//         }, 1000);
//       });
//     }
//   });
// }
