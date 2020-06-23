angular
  .module("ent.authentication", [])

  .service("AuthenticationService", function (
    domainENT,
    OAuth2Params,
    RequestService,
    $rootScope
  ) {
    this.doAuthent = (params) => {
      var base64Value = btoa(
        OAuth2Params.clientId.concat(":").concat(OAuth2Params.secret)
      );

      var url = `${domainENT}/auth/oauth2/token`;
      var headers = { Authorization: "Basic " + base64Value };
      var data = {
        scope: OAuth2Params.scope,
        client_id: OAuth2Params.clientId,
        client_secret: OAuth2Params.secret,
      };

      if (!!params.refreshToken) {
        data["grant_type"] = "refresh_token";
        data["refresh_token"] = params.refreshToken;
      } else {
        data["grant_type"] = "password";
        data["username"] = params.username;
        data["password"] = params.password;
      }

      return RequestService.post(url, null, data, {
        headers,
        serializer: "urlencoded",
      }).then(function (result) {
        let response = {
          access: result.data.access_token,
          refresh: result.data.refresh_token,
        };
        RequestService.setDefaultAuth(response);
        $rootScope.$emit("LoggedIn");
        return response;
      });
    };

    this.relog = (success, failure) => {
      if (
        localStorage.getItem("RememberMe") &&
        localStorage.getItem("refresh") != null
      ) {
        this.doAuthent({
          refreshToken: localStorage.getItem("refresh").toString(),
        }).then(success, () => {
          localStorage.setItem("RememberMe", "false");
          failure();
        });
      } else {
        failure();
      }
    };
  })

  .controller("LoginCtrl", function (
    $ionicPlatform,
    $scope,
    $state,
    AuthenticationService,
    $rootScope,
    $stateParams,
    $ionicScrollDelegate,
    NotificationService
  ) {
    $scope.user = {};

    $ionicPlatform.ready(function () {
      if ($stateParams.hasOwnProperty("prefill") && $stateParams["prefill"]) {
        $scope.user = {
          username: localStorage.getItem("username"),
          password: localStorage.getItem("password"),
          rememberMe: !!localStorage.getItem("RememberMe"),
        };
      }
    });

    $scope.doLogin = function () {
      AuthenticationService.doAuthent({
        username: $scope.user.username,
        password: $scope.user.password,
      }).then(
        function (response) {
          $scope.wrongLogin = false;
          localStorage.setItem("username", $scope.user.username);
          localStorage.setItem("password", $scope.user.password);
          if ($scope.user.rememberMe == true) {
            localStorage.setItem("RememberMe", "true");
            localStorage.setItem("refresh", response.refresh);
            if (!localStorage.getItem("fcmToken")) {
              window.FirebasePlugin.getToken((token) => {
                NotificationService.setFcmToken(token);
              });
            }
          }
          $state.go("app.timeline_list");
          $ionicScrollDelegate.resize();
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
