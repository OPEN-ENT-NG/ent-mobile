angular
  .module("ent.actualites", ["ent.actualites_service"])

  .controller("ActualitesCtrl", function(
    $ionicPlatform,
    $ionicScrollDelegate,
    $location,
    $scope,
    $state,
    $rootScope,
    ActualitesService,
    $ionicLoading,
    $anchorScroll
  ) {
    $rootScope.notification = $rootScope.notification || {};

    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.loaded", function() {
        setTimeout(function() {
          navigator.splashscreen.hide();
        }, 100);
      });

      $scope.$on("$ionicView.enter", function() {
        $rootScope.navigator = navigator;
        getActualites();
      });
    });

    $scope.getCountComments = function(info, commentsAreShown) {
      if (info.comments != null) {
        var text;
        if (commentsAreShown) {
          text =
            $scope.translationActus["actualites.info.label.comments.close"];
        } else {
          text =
            $scope.translationActus["actualites.info.label.comments"] +
            " (" +
            info.comments.length +
            ")";
        }
        return text;
      }
    };

    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleComments = function(info) {
      if ($scope.areCommentsShown(info)) {
        $scope.shownComments = null;
      } else {
        $scope.shownComments = info;
      }
    };

    $scope.areCommentsShown = function(info) {
      return $scope.shownComments === info;
    };

    $scope.goThreads = function() {
      $state.go("app.threads");
    };

    $scope.filterByThread = function(thread) {
      return (
        $rootScope.filterThreads[thread.thread_id] |
        noFilter($rootScope.filterThreads)
      );
    };

    function noFilter(filterObj) {
      for (var key in filterObj) {
        if (filterObj[key]) {
          return false;
        }
      }
      return true;
    }

    $scope.doRefreshInfos = function() {
      $scope.infos.unshift(getActualites());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.doRefreshThreads = function() {
      $scope.threads.unshift(getActualites());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.loadMore = function() {
      $scope.totalDisplayed += 3;
      $scope.$broadcast("scroll.infiniteScrollComplete");
    };

    //the controller
    function getActualites() {
      $scope.totalDisplayed = 10;
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });

      $scope.infos = [];
      $scope.threads = [];
      var threadIds = [];

      ActualitesService.getAllInfos().then(
        function(resp) {
          for (var i = 0; i < resp.data.length; i++) {
            if (resp.data[i].status == 3) {
              $scope.infos.push({
                _id: resp.data[i]._id,
                title: resp.data[i].title,
                content: resp.data[i].content,
                publication_date: resp.data[i].publication_date,
                modified: resp.data[i].modified,
                thread_id: resp.data[i].thread_id,
                username: resp.data[i].username,
                thread_icon: $scope.setCorrectImage(
                  resp.data[i].thread_icon,
                  "/../../../img/illustrations/actualites-default.png"
                ),
                comments: angular.fromJson(resp.data[i].comments)
              });

              var thread = {
                thread_id: resp.data[i].thread_id,
                title: resp.data[i].thread_title,
                thread_icon: $scope.setCorrectImage(
                  resp.data[i].thread_icon,
                  "/../../../img/illustrations/actualites-default.png"
                )
              };
              if (threadIds.indexOf(thread.thread_id) == -1) {
                $scope.threads.push(thread);
                threadIds.push(thread.thread_id);
              }
            }
          }
          $ionicLoading.hide();

          setTimeout(function() {
            console.error($rootScope.notification);
            if (
              $rootScope.notification.hasOwnProperty("id") &&
              $rootScope.notification.state === "app.actualites"
            ) {
              console.log("Scrolling to news " + $rootScope.notification.id);
              $location.hash($rootScope.notification.id);
              $rootScope.notification = {};
            }
          }, 100);
        },
        function() {
          $ionicLoading.hide();
        }
      );
    }
  });
