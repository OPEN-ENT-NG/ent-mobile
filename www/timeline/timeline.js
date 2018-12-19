angular
  .module("ent.timeline", ["ent.timeline_service"])
  .controller("TimelineCtrl", function(
    $scope,
    $ionicPlatform,
    TimelineService,
    $rootScope,
    $ionicLoading,
    domainENT,
    $state
  ) {
    $scope.preferences = [];
    $scope.filter = [];
    $scope.timeline = [];

    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.loaded", function() {
        setTimeout(function() {
          navigator.splashscreen.hide();
        }, 100);
      });

      $scope.$on("$ionicView.enter", function() {
        if ($state.current.name === "app.timeline.list") {
          $rootScope.navigator = navigator;
          $scope.totalDisplayed = 10;

          getTimeline();
        } else if ($state.current.name === "app.timeline.prefs") {
          getPreferences();
        } else {
          $state.go("app.timeline.list");
        }
      });
    });

    $scope.getThumbnail = function(user) {
      return domainENT + "/userbook/avatar/" + user;
    };

    $scope.alterHTML = function(message) {
      var ret = message.replace(/href=['"]?[^'"\s>]*['"]/g, "");
      return ret;
    };

    $scope.goPrefs = function() {
      $state.go("app.timeline.prefs");
    };

    function getPreferences() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      TimelineService.getTranslation().then(translation => {
        TimelineService.getTypes().then(types => {
          $scope.preferences = [];

          types.data.forEach(element => {
            let elementName =
              translation[0].data[element.toLowerCase()] ||
              translation[1].data[element.toLowerCase()];
            if (elementName != null) {
              $scope.preferences.push({
                type: element,
                name: elementName,
                checked: false
              });
            }

            TimelineService.getPreferences().then(prefs => {
              let filter = JSON.parse(prefs.data.preference).type;
              filter.forEach(element => {
                $scope.preferences.find(
                  elem => elem.type === element
                ).checked = true;
              });
              $ionicLoading.hide();
            });
          });
        });
      });
    }

    function getTimeline() {
      $scope.totalDisplayed = 10;
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });

      TimelineService.getPreferences().then(prefs => {
        let filter = JSON.parse(prefs.data.preference).type;
        TimelineService.getTimeline(formatFilter(filter)).then(resp => {
          $scope.timeline = resp.data.results;
          $ionicLoading.hide();
        });
      });
    }

    function formatFilter(filter) {
      let result = "";
      filter.forEach(element => {
        result += "&type=" + element;
      });
      return result;
    }

    $scope.loadMore = function() {
      $scope.totalDisplayed += 3;
      $scope.$broadcast("scroll.infiniteScrollComplete");
    };

    $scope.updatePreferences = function() {
      TimelineService.updatePreferences(
        $scope.preferences.filter(elem => elem.checked).map(elem => elem.type)
      );
    };
  });
