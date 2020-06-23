angular
  .module("ent.timeline", ["ent.timeline_service"])
  .controller("TimelineCtrl", function (
    $scope,
    $ionicPlatform,
    TimelineService,
    $ionicLoading,
    $state,
    PopupFactory,
    NotificationService
  ) {
    $scope.types = [];
    $scope.timeline = [];
    $scope.flashMsg = [];

    $ionicPlatform.ready(function () {
      $scope.$on("$ionicView.enter", function () {
        if ($state.is("app.timeline_list")) {
          getTimeline();
          getFlashMsg();
        } else if ($state.is("app.timeline_prefs")) {
          getPreferences();
        } else {
          $state.go("app.timeline_list");
        }
      });
    });

    $scope.doRefreshTimeline = function () {
      getTimeline();
      getFlashMsg();
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.getThumbnail = function (user) {
      return "/userbook/avatar/" + user;
    };

    $scope.alterHTML = function (message) {
      var ret = message.replace(/href=['"]?[^'"\s>]*['"]/g, "");
      return ret;
    };

    $scope.goPrefs = function () {
      $state.go("app.timeline_prefs");
    };

    $scope.clickTimelineNotif = function (type, resource, params) {
      let serviceParams = {};

      switch (type) {
        case "MESSAGERIE": {
          serviceParams.idMessage = resource;
          break;
        }
        case "NEWS": {
          serviceParams.idActu = params.resourceUri.split("/").pop();
          break;
        }
        case "BLOG": {
          let ids = params.resourceUri.split("/");
          serviceParams.idPost = ids.pop();
          serviceParams.idBlog = ids.pop();
          break;
        }
        case "WORKSPACE": {
          break;
        }
        default: {
          serviceParams.uri = params.resourceUri || params.uri;
          break;
        }
      }

      NotificationService.notificationHandler(type, serviceParams);
    };

    function getPreferences() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      $scope.preferences = [];
      $scope.types = [];

      TimelineService.getTranslation().then((translation) => {
        TimelineService.getTypes().then((allTypes) => {
          TimelineService.getPreferences().then((prefs) => {
            $scope.preferences = JSON.parse(prefs.data.preference);
            $scope.types = $scope.preferences.types || [];

            types = JSON.parse(prefs.data.preference).type;

            allTypes.data.forEach((type) => {
              let name =
                translation[0].data[type.toLowerCase()] ||
                translation[1].data[type.toLowerCase()];

              if (name != null) {
                let checked = false;
                for (const iterator of types) {
                  if (iterator == type) {
                    checked = true;
                    break;
                  }
                }

                $scope.types.push({
                  type: type,
                  name: name,
                  checked: checked,
                });
              }
            });
            $ionicLoading.hide();
          });
        });
      });
    }

    function getTimeline() {
      $scope.totalDisplayed = 10;
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });

      TimelineService.getPreferences().then((prefs) => {
        let filter = [];
        if (prefs.data.preference) {
          filter = JSON.parse(prefs.data.preference).type;
        }
        TimelineService.getTimeline(filter).then((resp) => {
          $scope.timeline = resp.data.results;
          $ionicLoading.hide();
        });
      });
    }

    $scope.loadMore = function () {
      $scope.totalDisplayed += 3;
      $scope.$broadcast("scroll.infiniteScrollComplete");
    };

    $scope.updatePreferences = function () {
      $scope.preferences.type = $scope.types
        .filter((elem) => elem.checked)
        .map((elem) => elem.type);

      TimelineService.updatePreferences($scope.preferences);
    };

    $scope.markAsRead = function (id) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      TimelineService.markAsRead(id)
        .then(getFlashMsg)
        .catch(PopupFactory.getCommonAlertPopup)
        .finally($ionicLoading.hide);
    };

    function getFlashMsg() {
      var scssVariables = {
        red: "#e13a3a",
        orange: "#FF9057",
        green: "#46bfaf",
        blue: "#2A9CC8",
      };

      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      TimelineService.getFlashMsg()
        .then(({ data }) => {
          $scope.flashMsg = data.map((msg) => {
            msg.contents = msg.contents.fr;
            msg.customColor = msg.color
              ? scssVariables[msg.color]
              : msg.customColor;
            return msg;
          });
        })
        .catch(PopupFactory.getCommonAlertPopup)
        .finally($ionicLoading.hide);
    }
  });
