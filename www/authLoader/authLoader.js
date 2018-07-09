angular.module('ent.authLoader', ['ent.oauth2'])
  .controller('AuthLoaderCtrl', function($scope, $ionicPlatform, OAuthService, $state){
      $ionicPlatform.ready(function () {
        var tmpRemMe = localStorage.getItem("RememberMe");
        if (tmpRemMe != null) {
          $scope.rememberMe = !!tmpRemMe;
        } else {
          localStorage.setItem("RememberMe", "false");
          $scope.rememberMe = false;
        }
        if ($scope.rememberMe == true && localStorage.getItem("refresh") != null) {
          OAuthService.doAuthent({refreshToken: localStorage.getItem("refresh").toString()})
            .then(function (response) {
              $scope.wrongLogin = false;
              localStorage.setItem('access_token', response.access);
              $state.go('app.actualites');
            }, function errorCallback() {
              $scope.rememberMe = false;
              localStorage.setItem("RememberMe", "false");
              $state.go('login');
              navigator.splashscreen.hide();
            })
        } else {
          $state.go('login');
          navigator.splashscreen.hide();
        }
      });
    });
