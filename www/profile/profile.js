angular.module('ent.profile', ['ent.profile_service'])
  .controller('ProfileCtrl', function ($scope, $rootScope, $ionicPopover, $ionicPlatform, domainENT, ProfileService) {

    $scope.loader = {
      preferences: false
    };

    $scope.updatePreferences = function () {
      $scope.loader.preferences = true;
      ProfileService.updatePreferences($scope.preferences).then(function () {
        $scope.loader.preferences = false;
      });
    };

    $ionicPlatform.ready(function () {
      $scope.$on('$ionicView.enter', function () {
        $rootScope.navigator = navigator;
        ProfileService.getUser().then(function (res) {
          console.log("test");
          $scope.myUser = $rootScope.myUser;
          $scope.user = res;
          var _splitted_date = res.data.birthDate.split('-');
          $scope.birthdate = new Date(_splitted_date[0], _splitted_date[1] - 1, _splitted_date[2]).toLocaleDateString();
          ProfileService.getApplications().then(function (applications) {
            $scope.apps = applications.data;
            ProfileService.getI18nNotifications().then(function (i18n) {
              $scope.translations = i18n.data;
              ProfileService.getPreferences().then(function (userAppConf) {
                $scope.appsMapped = {};
                $scope.applis = {};
                for (var i = 0; i < $scope.apps.length; i++) {
                  $scope.appsMapped[$scope.apps[i].key] = $scope.apps[i];
                }

                for (var i = 0; i < $scope.apps.length; i++) {
                  if (!$scope.applis.hasOwnProperty($scope.apps[i].type)) {
                    $scope.applis[$scope.apps[i].type] = {
                      translation: $scope.translations.hasOwnProperty($scope.apps[i]['app-name'].toLowerCase()) ? $scope.translations[$scope.apps[i]['app-name'].toLowerCase()] : $scope.apps[i]['app-name'],
                      notifications: []
                    };
                  }
                  if ($scope.apps[i]['push-notif']) {
                    $scope.applis[$scope.apps[i].type].notifications.push($scope.apps[i].key);
                  }
                }

                var _tmp = [];
                var keys = Object.keys($scope.applis);
                for (var i = 0; i < keys.length; i++) {
                  _tmp.push($scope.applis[keys[i]]);
                }

                $scope.applis = _tmp;
                $scope.preferences = JSON.parse(userAppConf.data.preference);
              });
            });
          });
        });
      });
    });
  });
