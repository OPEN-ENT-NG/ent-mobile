angular
  .module("ent.actualites", ["ent.actualites_service"])

  .controller("ActualitesCtrl", function (
    $ionicPlatform,
    $scope,
    $state,
    $rootScope,
    ActualitesService,
    $ionicLoading
  ) {
    $ionicPlatform.ready(function () {
      $scope.$on("$ionicView.enter", function () {
        getActualites();
      });
    });

    $scope.getCountComments = function (info, commentsAreShown) {
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

    $scope.toggleComments = function (info) {
      if ($scope.areCommentsShown(info)) {
        $scope.shownComments = null;
      } else {
        $scope.shownComments = info;
      }
    };

    $scope.areCommentsShown = function (info) {
      return $scope.shownComments === info;
    };

    $scope.goThreads = function () {
      $state.go("app.threads");
    };

    $scope.filterByThread = function (thread) {
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

    $scope.doRefreshInfos = function () {
      $scope.infos.unshift(getActualites());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.doRefreshThreads = function () {
      $scope.threads.unshift(getActualites());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.loadMore = function () {
      $scope.totalDisplayed += 3;
      $scope.$broadcast("scroll.infiniteScrollComplete");
    };

    $scope.getImage = function(info) {
      return info.icon || "/assets/themes/paris/img/illustrations/actualites-default.png"
    }

    function getActualites() {
      $scope.totalDisplayed = 10;
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });

      $scope.infos = [];
      $scope.threads = [];

      return ActualitesService.getAllInfos()
        .then(function (resp) {
          $scope.infos = resp.data
            .filter(function (info) {
              return info.status == 3;
            })
            .map(function (info) {
              if (
                !$scope.threads.some(function (thread) {
                  return thread.thread_id == info.thread_id;
                })
              ) {
                $scope.threads.push({
                  thread_id: info.thread_id,
                  title: info.thread_title,
                });
              }

              return {
                _id: info._id,
                title: info.title,
                content: info.content,
                publication_date: info.publication_date,
                modified: info.modified,
                thread_id: info.thread_id,
                username: info.username,
                comments: JSON.parse(info.comments),
              };
            });
        })
        .finally($ionicLoading.hide);
    }
  });
