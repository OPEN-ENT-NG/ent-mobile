angular.module('ent.firstConnection', [])

  .controller('FirstConnectionCtrl', function ($timeout, $ionicPlatform, $scope, FirstConnectionService) {

    $ionicPlatform.ready(function () {
      getRegex();


    });

    $scope.doActivate = function (user) {
      FirstConnectionService.activate(user).then(function (resp) {
        if(resp.data.error) {
          $scope.error = resp.data.error.message;
          $timeout(function () {
            delete $scope.error;
          }, 2000);
        } else {
          $scope.success = 'Compte activé avec succès';
        }
      });
    }

    $scope.passwordComplexity = function (password) {

      if (!password) {
        return 0;
      }

      if (password.length < 6) {
        return password.length;
      }

      var score = password.length
      if (/[0-9]+/.test(password) && /[a-zA-Z]+/.test(password)) {
        score += 5;
      }
      if (!/^[a-zA-Z0-9- ]+$/.test(password)) {
        score += 5;
      }

      return score;
    }

    $scope.translateComplexity = function (score, fr) {

      if (score < 12) {
        return fr ? 'Faible' : 'weak';
      } else if (score < 20) {
        return fr ? 'Modérée' : 'moderate';
      } else {
        return fr ? 'Forte' : 'strong';
      }
    };

    function getRegex () {
      FirstConnectionService.getPasswordRegex().then(function (data) {
        $scope.regex = data.passwordRegex;
      });
    }
  })
