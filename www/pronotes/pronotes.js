angular.module('ent.pronotes', ['ent.pronotes_service'])

  .controller('ListingUsersCtrl', function (domainENT, $scope, $rootScope, $window, PronoteService, $ionicPlatform,
                                            $http, $sce, $state, $ionicLoading) {

    $scope.showPronote = function (link, namePronote) {
      $rootScope.pronoteName = namePronote;
      $rootScope.link = $sce.trustAsResourceUrl(link);
      $state.go("app.pronote");
    }

    $scope.getAllAccounts = function () {
      $scope.pronotes = [];
      PronoteService.getAllApps().then(function (resp) {
        if (resp != null)
          for (var i = 0; i < resp.data.apps.length; i++) {
            if (resp.data.apps[i].name.indexOf("Pronote") > -1) {
              $scope.pronotes.push({
                name: resp.data.apps[i].name,
                address: domainENT + "/cas/oauth/login?service=" + encodeURIComponent(resp.data.apps[i].address)
              });
            }
          }
      });
    }

    $ionicPlatform.ready(function () {
      $scope.$on('$ionicView.enter', function () {
        $scope.pronotes = [];

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
        } else {
          $scope.getAllAccounts();
        }
      });
    });
  });
