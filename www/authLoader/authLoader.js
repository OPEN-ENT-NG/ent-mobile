angular
  .module("ent.authLoader", ["ent.oauth2"])
  .controller("AuthLoaderCtrl", function(
    $scope,
    $ionicPlatform,
    OAuthService,
    $state
  ) {
    $ionicPlatform.ready(function() {
      if (
        localStorage.getItem("RememberMe") &&
        localStorage.getItem("refresh") != null
      ) {
        OAuthService.doAuthent({
          refreshToken: localStorage.getItem("refresh").toString()
        }).then(
          () => {
            $scope.$emit("loggedIn");
            $state.go("app.timeline_list");
          },
          () => {
            localStorage.setItem("RememberMe", "false");
            $state.go("login");
            navigator.splashscreen.hide();
          }
        );
      } else {
        $state.go("login");
        navigator.splashscreen.hide();
      }
    });
  });
