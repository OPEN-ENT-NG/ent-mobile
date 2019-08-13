angular
  .module("ent.profile", ["ent.profile_service"])
  .controller("ProfileCtrl", function(
    $scope,
    $rootScope,
    $ionicPlatform,
    ProfileService,
    TimelineService,
    $ionicLoading,
    PopupFactory,
    UserFactory,
    $timeout
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        $scope.loader = {
          preferences: false
        };

        $scope.settings = {
          app: undefined
        };
      });

      $scope.$on("$ionicView.beforeEnter", function() {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        getUserApp().finally($ionicLoading.hide);
      });
    });

    $scope.updatePreferences = function() {
      $scope.loader.preferences = true;
      TimelineService.updatePreferences($scope.preferences).then(function() {
        $scope.loader.preferences = false;
      });
    };

    $scope.isFieldToggled = function(field) {
      return $scope.editting == field;
    };

    $scope.toggleField = function(field) {
      function initTempProfile() {
        $scope.tempProfile = Object.assign({}, $rootScope.myUser);
        $scope.tempProfile.loginAlias =
          $rootScope.myUser.loginAlias || $rootScope.myUser.login;
      }

      if (field) {
        initTempProfile();
        $scope.editting = field;
        $timeout(() => document.getElementById(field).focus());
      } else {
        delete $scope.editting;
      }
    };

    $scope.saveField = function(field) {
      let mailRegexp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g;
      let phoneRegexp = /^(00|\+)?([0-9][ \-\.]*){6,15}$/g;
      let errorTitle = null;

      switch (field) {
        case "loginAlias": {
          changeMade = $rootScope.myUser.loginAlias
            ? $scope.tempProfile.loginAlias != $rootScope.myUser.loginAlias
            : $scope.tempProfile.loginAlias != $rootScope.myUser.login;
          break;
        }
        case "email": {
          changeMade = $scope.tempProfile.email != $rootScope.myUser.email;
          if (
            !!$scope.tempProfile.email &&
            !mailRegexp.test($scope.tempProfile.email)
          )
            errorTitle = "Adresse email invalide";
          break;
        }
        case "mobile": {
          changeMade = $scope.tempProfile.mobile != $rootScope.myUser.mobile;
          if (
            !!$scope.tempProfile.mobile &&
            !phoneRegexp.test($scope.tempProfile.mobile)
          )
            errorTitle = "Adresse email invalide";

          break;
        }
        case "displayName": {
          changeMade =
            $scope.tempProfile.displayName != $rootScope.myUser.displayName;
          break;
        }
      }

      if (errorTitle) {
        PopupFactory.getAlertPopup(errorTitle, "Format invalide");
      } else if (changeMade) {
        saveProfile($rootScope.pick($scope.tempProfile, [field]));
      }
      $scope.toggleField();
    };

    function saveProfile(profile) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      ProfileService.saveProfile(profile)
        .then(() => UserFactory.getUser(true))
        .then(user => ($rootScope.myUser = user))
        .catch(err => {
          PopupFactory.getAlertPopupNoTitle(err.data.error);
        })
        .finally($ionicLoading.hide);
    }

    function getUserApp() {
      return ProfileService.getApplications().then(function(applications) {
        $scope.apps = applications.data.filter(
          notif =>
            notif.restriction !== "INTERNAL" && notif.restriction !== "HIDDEN"
        );

        return ProfileService.getI18nNotifications().then(function(
          translation
        ) {
          $scope.translations = translation.data;
          TimelineService.getPreferences().then(function(userAppConf) {
            $scope.appsMapped = {};
            $scope.applis = {};
            for (var i = 0; i < $scope.apps.length; i++) {
              $scope.appsMapped[$scope.apps[i].key] = $scope.apps[i];
            }

            for (var i = 0; i < $scope.apps.length; i++) {
              if (!$scope.applis.hasOwnProperty($scope.apps[i].type)) {
                $scope.applis[$scope.apps[i].type] = {
                  translation: $scope.translations.hasOwnProperty(
                    $scope.apps[i]["app-name"].toLowerCase()
                  )
                    ? $scope.translations[
                        $scope.apps[i]["app-name"].toLowerCase()
                      ]
                    : $scope.apps[i]["app-name"],
                  notifications: []
                };
              }
              if ($scope.apps[i]["push-notif"]) {
                $scope.applis[$scope.apps[i].type].notifications.push(
                  $scope.apps[i].key
                );
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
    }
  });
