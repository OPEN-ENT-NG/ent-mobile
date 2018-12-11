angular
  .module("ent.pronotes", ["ent.pronotes_service"])

  .controller("PronoteCtrl", function(
    domainENT,
    $scope,
    $rootScope,
    $window,
    PronoteService,
    $ionicPlatform,
    $http,
    $sce,
    $state,
    $ionicLoading,
    RequestService
  ) {
    $scope.pronotes = [];

    $scope.showPronote = function(link, namePronote) {
      $rootScope.pronoteName = namePronote;
      var profileMap = {
        TEACHER: "professeur",
        STUDENT: "eleve",
        RELATIVE: "parent"
      };
      if (
        Object.keys(profileMap).indexOf(
          $rootScope.myUser.userType.toUpperCase()
        ) !== -1
      ) {
        link +=
          "mobile." +
          profileMap[$rootScope.myUser.userType.toUpperCase()] +
          ".html?";
      }
      $rootScope.link = $sce.trustAsResourceUrl(link);
      $state.go("app.pronote");
    };

    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        $scope.pronotes = [];

        if ($state.is("app.pronote")) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });

          RequestService.get($sce.getTrustedResourceUrl($rootScope.link)).then(
            function success(response) {
              $scope.link = $sce.trustAsResourceUrl(
                response.headers()["location"]
              );

              document.querySelector("#iframe").onload = function() {
                $ionicLoading.hide();
              };
            },
            function error(err) {
              $ionicLoading.hide();
            }
          );
        } else if ($state.is("app.listPronotes")) {
          PronoteService.getAllAccounts().then(function(resp) {
            $scope.pronotes = resp || [];
          });
        }
      });
    });
  });
