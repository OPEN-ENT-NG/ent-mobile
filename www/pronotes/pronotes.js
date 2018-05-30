angular.module('ent.pronotes', ['ent.pronotes_service'])

  .controller('ListingUsersCtrl', function (domainENT, $scope, $rootScope, $window, PronoteService, $ionicPlatform,
                                            $http, $sce, $state, $ionicLoading) {
    $scope.pronotes = [];

    $ionicPlatform.ready(function () {
      $scope.$on('$ionicView.enter', function () {
        PronoteService.getAllApps().then(function (resp) {
          if (resp != null)
            for (var i = 0; i < resp.data.apps.length; i++) {
              if (resp.data.apps[i].name.indexOf("Pronote") > -1) {
                $scope.pronotes.push({
                  name: resp.data.apps[i].name,
                  address: domainENT + "/oauth/login?service=" + btoa(resp.data.apps[i].address)
                });
              }
            }
          if ($scope.pronotes.length === 0) {
            $scope.pronotes.push({
              name: "test",
              address: domainENT + "/cas/oauth/login?service=" + encodeURIComponent("https://extranet.clg-jean-baptiste-poquelin.ac-paris.fr/pronote/")
            });
          }
        });
      });

      if ($state.current.name == "app.pronote") {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });

        $http.get($rootScope.link, {
          "Authorization": $http.defaults.headers.common['Authorization']
        }).then(function success(response) {
          $scope.link = $sce.trustAsResourceUrl(response.headers()['location']);

          document.querySelector("#iframe").onload = function () {
            $ionicLoading.hide()
          };
        }, function error(err) {
          $ionicLoading.hide();
        });
      }
    });

    $scope.showPronote = function (link, namePronote) {
      $rootScope.pronoteName = namePronote;
      $rootScope.link = $sce.trustAsResourceUrl(link);
      $state.go("app.pronote");
    }
  });
