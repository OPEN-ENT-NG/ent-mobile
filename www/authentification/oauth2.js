angular
  .module("ent.oauth2", [])

  .service("OAuthService", function(domainENT, OAuth2Params, RequestService) {
    this.doAuthent = function(params) {
      var data =
        "client_id=" +
        OAuth2Params.clientId +
        "&client_secret=" +
        OAuth2Params.secret +
        "&scope=" +
        OAuth2Params.scope;
      if (params.refreshToken) {
        data +=
          "&grant_type=refresh_token&refresh_token=" + params.refreshToken;
      } else {
        data +=
          "&grant_type=password&username=" +
          params.username +
          "&password=" +
          params.password;
      }

      // getting the token
      var base64Value = btoa(
        OAuth2Params.clientId.concat(":").concat(OAuth2Params.secret)
      );

      var url = domainENT + "/auth/oauth2/token";
      return RequestService.post(url, data, {
        headers: { Authorization: "Basic " + base64Value }
      }).then(function(result) {
        return RequestService.setDefaultAuth({
          access: result.data.access_token,
          refresh: result.data.refresh_token
        });
      });
    };

    this.setFcmToken = function() {
      window.FirebasePlugin.getToken(function(token) {
        if (token == null) {
          setTimeout(this.setFcmToken, 1000);
          return;
        }
        var url = domainENT + "/timeline/pushNotif/fcmToken?fcmToken=" + token;
        RequestService.put(url).then(
          function(response) {
            localStorage.setItem("fcmToken", token);
          },
          function(error) {
            throw error;
          }
        );
      });
    }.bind(this);

    this.deleteFcmToken = function() {
      var fcmToken = localStorage.getItem("fcmToken");
      if (fcmToken == null) return;
      var url = domainENT + "/timeline/pushNotif/fcmToken?fcmToken=" + fcmToken;
      return RequestService.delete(url);
    };
  })

  .controller("LoginCtrl", function(
    $ionicPlatform,
    $scope,
    $state,
    OAuthService,
    $rootScope,
    $stateParams
  ) {
    $scope.user = {};

    $ionicPlatform.ready(function() {
      $rootScope.navigator = navigator;
      if ($stateParams.hasOwnProperty("prefill") && $stateParams["prefill"]) {
        $scope.user = {
          username: localStorage.getItem("username"),
          password: localStorage.getItem("password"),
          rememberMe: !!localStorage.getItem("RememberMe")
        };
      }
    });

    $scope.doLogin = function() {
      OAuthService.doAuthent({
        username: $scope.user.username,
        password: $scope.user.password
      }).then(
        function(response) {
          $scope.wrongLogin = false;
          localStorage.setItem("username", $scope.user.username);
          localStorage.setItem("password", $scope.user.password);
          if ($scope.user.rememberMe == true) {
            localStorage.setItem("RememberMe", "true");
            localStorage.setItem("refresh", response.refresh);
            OAuthService.setFcmToken();
          }
          $state.go("app.timeline_list");
        },
        function errorCallback() {
          $scope.wrongLogin = true;
          $scope.user.rememberMe = false;
          localStorage.setItem("RememberMe", "false");
          $state.go("login");
        }
      );
    };
  });
