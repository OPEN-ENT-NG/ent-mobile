angular.module('ent.oauth2', [])

  .service('OAuthService', function($q, domainENT, $ionicLoading, OAuth2Params, RequestService){

    this.doAuthent = function (params) {
      var data = 'client_id=' + OAuth2Params.clientId + '&client_secret=' + OAuth2Params.secret + '&scope=' + OAuth2Params.scope;
      if(params.refreshToken) {
        data += '&grant_type=refresh_token&refresh_token=' + params.refreshToken;
      } else {
        data += '&grant_type=password&username=' + params.username + '&password=' + params.password;
      }

      // getting the token
      var base64Value = btoa(OAuth2Params.clientId.concat(":").concat(OAuth2Params.secret));

      var url = domainENT + "/auth/oauth2/token";
      return RequestService.post(url, data, {headers: {Authorization: 'Basic ' + base64Value}}).then(function (result) {
        return RequestService.setDefaultAuth({access: result.data.access_token, refresh: result.data.refresh_token});
      });
    };

    this.setFcmToken = function() {
      window.FirebasePlugin.getToken(function (token) {
        if (token == null) {
          setTimeout(this.setFcmToken, 1000);
          return;
        }
        var url = domainENT + "/timeline/pushNotif/fcmToken?fcmToken=" + token;
        console.log(url);
        RequestService.put(url).then(function (response) {
          console.log(response);
          localStorage.setItem('fcmToken', token);
        }, function (error) {
          console.log("put token failed");
          throw error;
        });
      });
    }.bind(this)

    this.deleteFcmToken = function () {
      var fcmToken = localStorage.getItem("fcmToken");
      if (fcmToken == null) return;
      var url = domainENT + "/timeline/pushNotif/fcmToken?fcmToken=" + fcmToken;
      return RequestService.delete(url);
    }
  })

  .controller('LoginCtrl', function($ionicPlatform, $scope, $state, OAuthService, $rootScope) {

    $ionicPlatform.ready(function () {
      $rootScope.navigator = navigator;
      CheckRememberMe();
    });

    function CheckRememberMe() {
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
            navigator.splashscreen.hide();
          })
      } else {
        navigator.splashscreen.hide();
      }
    }

    $scope.doLogin= function(user){
      OAuthService.doAuthent({username: user.username, password: user.password}).
      then(function(response){
        console.log(response);
        $scope.wrongLogin = false;
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('username', user.username);
        localStorage.setItem('password', response.access);
        if ($scope.rememberMe == true) {
          localStorage.setItem('refresh', response.refresh);
          OAuthService.setFcmToken();
        }
        $state.go('app.actualites');
      }, function errorCallback() {
        $scope.wrongLogin = true;
        $scope.rememberMe = false;
        localStorage.setItem("RememberMe", "false");
        $state.go("login");
      })
    }

    $scope.rememberMeClicked = function() {
      $scope.rememberMe = !$scope.rememberMe;
      localStorage.setItem("RememberMe", $scope.rememberMe);
      console.log("changed remember me to " + $scope.rememberMe);
    }
  })
