angular
  .module("ent.firstConnection", [])

  .controller("FirstConnectionCtrl", function(
    $timeout,
    $ionicPlatform,
    $scope,
    FirstConnectionService,
    $rootScope,
    OAuthService,
    $state
  ) {
    $ionicPlatform.ready(function() {
      getRegex();
    });

    $scope.doActivate = function(user) {
      FirstConnectionService.activate(user).then(function(resp) {
        if (resp.data.error) {
          $scope.error = resp.data.error.message;
        } else {
          $rootScope.success = "Compte activé avec succès";
          doLogin(user.login, user.password);
        }
        $timeout(function() {
          delete $scope.error;
          delete $rootScope.success;
        }, 2000);
      });
    };

    var doLogin = function(username, password) {
      OAuthService.doAuthent({
        username,
        password
      }).then(
        () => {
          localStorage.setItem("username", username);
          localStorage.setItem("password", password);
          $state.go("app.timeline.list");
        },
        () => {
          $state.go("login");
        }
      );
    };

    $scope.passwordComplexity = function(password) {
      if (!password) {
        return 0;
      }

      if (password.length < 6) {
        return password.length;
      }

      var score = password.length;
      if (/[0-9]+/.test(password) && /[a-zA-Z]+/.test(password)) {
        score += 5;
      }
      if (!/^[a-zA-Z0-9- ]+$/.test(password)) {
        score += 5;
      }

      return score;
    };

    $scope.translateComplexity = function(score, fr) {
      if (score < 12) {
        return fr ? "Faible" : "weak";
      } else if (score < 20) {
        return fr ? "Modérée" : "moderate";
      } else {
        return fr ? "Forte" : "strong";
      }
    };

    function getRegex() {
      FirstConnectionService.getPasswordRegex().then(function(data) {
        $scope.regex = data.passwordRegex;
      });
    }
  });
