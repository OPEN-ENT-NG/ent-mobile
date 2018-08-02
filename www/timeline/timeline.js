angular.module('ent.timeline', ['ent.timeline_service'])
  .controller('TimelineCtrl', function ($scope, $ionicPlatform, TimelineService, $rootScope, $ionicLoading, domainENT) {
    $ionicPlatform.ready(function() {
      $scope.$on('$ionicView.loaded', function () {
        setTimeout(function () {
          navigator.splashscreen.hide();
        }, 100);
      });

      $scope.$on('$ionicView.enter', function () {
        console.log("HELLO");
        $rootScope.navigator = navigator;
        console.log("timeline");
        $scope.totalDisplayed = 10;
        getTimeline();
      });
    });

    $scope.getThumbnail = function(user)
    {
      return domainENT + "/userbook/avatar/" + user;
    }

    $scope.alterHTML = function(message) {
       var ret = message.replace(/href=['"]?[^'"\s>]*['"]/g, "");
       return ret;
    }

    function getTimeline() {
      $scope.totalDisplayed = 10;
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });

      $scope.timeline = [];
      TimelineService.getTimeline().then(function (resp) {
        $ionicLoading.hide();
        console.log(resp);
        $scope.timeline = resp.data.results;
      });
    }

    $scope.loadMore = function () {
      $scope.totalDisplayed += 3;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    };
});
