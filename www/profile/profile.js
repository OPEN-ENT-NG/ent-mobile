angular
  .module("ent.profile", ["ent.profile_service"])
  .controller("ProfileCtrl", function(
    $scope,
    $rootScope,
    $ionicPlatform,
    ProfileService,
    TimelineService,
    $ionicPopover,
    $ionicLoading,
    PopupFactory,
    UserFactory
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        $scope.loader = {
          preferences: false
        };

        $scope.settings = {
          app: undefined
        };

        $scope.editable = false;
      });

      $scope.$on("$ionicView.beforeEnter", function() {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        getUserApp().finally($ionicLoading.hide);

        $ionicPopover
          .fromTemplateUrl("profile/popover_profile.html", {
            scope: $scope
          })
          .then(function(popover) {
            $rootScope.popover = popover;
          });
      });
    });

    $scope.updatePreferences = function() {
      $scope.loader.preferences = true;
      TimelineService.updatePreferences($scope.preferences).then(function() {
        $scope.loader.preferences = false;
      });
    };

    $scope.editModeEnabled = function() {
      return $scope.editable;
    };

    $scope.toggleEditProfile = function(value) {
      if (value) $scope.tempProfile = $rootScope.extend({}, $rootScope.myUser);
      $scope.editable = value;
    };

    $scope.checkEditMade = function(originalProfile, edittedProfile) {
      return (
        originalProfile.loginAlias == edittedProfile.loginAlias &&
        originalProfile.displayName == edittedProfile.displayName &&
        originalProfile.email == edittedProfile.email &&
        originalProfile.mobile == edittedProfile.mobile
      );
    };

    $scope.saveProfile = function() {
      var checkProfileValidity = function(profile) {
        let mailRegexp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g;
        let phoneRegexp = /^(00|\+)?([0-9][ \-\.]*){6,15}$/g;

        if (!!profile.email && !mailRegexp.test(profile.email)) {
          return "Adresse email invalide";
        } else if (!!profile.mobile && !phoneRegexp.test(profile.mobile)) {
          return "Numéro de mobile";
        } else {
          return null;
        }
      };

      $scope.editable = false;
      let errorTitle = checkProfileValidity($scope.tempProfile);

      if (errorTitle) {
        PopupFactory.getAlertPopup(errorTitle, "Format invalide");
      } else {
        ProfileService.saveProfile($scope.tempProfile)
          .then(() => UserFactory.getUser(true))
          .then(user => ($rootScope.myUser = user))
          .catch(err => PopupFactory.getAlertPopupNoTitle(err.data.error))
          .finally($ionicLoading.hide);
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
      }
    };

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
