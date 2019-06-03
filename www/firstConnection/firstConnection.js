angular
  .module("ent.firstConnection", [])

  .controller("FirstConnectionCtrl", function(
    $ionicHistory,
    $timeout,
    $ionicPlatform,
    $scope,
    FirstConnectionService,
    $rootScope,
    AuthenticationService,
    $state,
    domainENT,
    $sce
  ) {
    $ionicPlatform.ready(function() {
      // getRegex();
      FirstConnectionService.getAuthTranslation().then(({ data }) => {
        $scope.translation = data;
      });
    });

    $scope.goBack = function() {
      $ionicHistory.goBack();
    };

    $scope.openCGU = function() {
      cordova.InAppBrowser.open(
        $sce.trustAsUrl(`${domainENT}${$scope.translation["auth.charter"]}`),
        "_system"
      );
    };

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
      AuthenticationService.doAuthent({
        username,
        password
      }).then(
        () => {
          localStorage.setItem("username", username);
          localStorage.setItem("password", password);
          $state.go("app.timeline_list");
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

    // function getRegex() {
    //   FirstConnectionService.getPasswordRegex().then(function(data) {
    //     $scope.regex = data.passwordRegex;
    //   });
    // }
  });
