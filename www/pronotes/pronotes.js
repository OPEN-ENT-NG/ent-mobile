angular
  .module("ent.pronotes", ["ent.pronotes_service"])

  .controller("PronoteCtrl", function(
    $scope,
    $rootScope,
    PronoteService,
    $ionicPlatform,
    $stateParams,
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
          $rootScope.myUser.type.toUpperCase()
        ) !== -1
      ) {
        link +=
          "mobile." +
          profileMap[$rootScope.myUser.type.toUpperCase()] +
          ".html?";
      }
      $state.go("app.pronote", { link: $sce.trustAsResourceUrl(link) });
    };

    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        $scope.pronotes = [];

        if ($state.is("app.pronote") && $stateParams.hasOwnProperty("link")) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });

          RequestService.get(
            $sce.getTrustedResourceUrl($stateParams.link)
          ).then(
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
        } else {
          $state.go("app.listPronotes");
        }
      });
    });
  });
