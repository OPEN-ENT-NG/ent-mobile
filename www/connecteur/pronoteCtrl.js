angular
  .module("ent.pronotes", [])

  .controller("PronoteCtrl", function(
    $scope,
    $rootScope,
    UserFactory,
    $ionicPlatform,
    $stateParams,
    $sce,
    $state,
    $ionicLoading,
    RequestService
  ) {
    $scope.noAccountError = "Pas de compte Pronote disponible";
    $scope.accountListName = "Liste des comptes Pronote";

    $scope.showConnecteur = function(link, name) {
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
          link += `${link.charAt(link.length - 1) == '/' ? "" : '/'}mobile.${profileMap[$rootScope.myUser.type.toUpperCase()]}.html?`;
      }
      $state.go("app.pronote", { link: $sce.trustAsResourceUrl(link), name });
    };

    $scope.getAllAccounts = function() {
      UserFactory.getApplicationsList().then(() => {
        $scope.accountList = UserFactory.getPronoteAccount();
      });
    };

    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
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
              $scope.name = $stateParams.name;

              document.querySelector("#iframe").onload = function() {
                $ionicLoading.hide();
              };
            },
            function error(err) {
              $ionicLoading.hide();
            }
          );
        } else if ($state.is("app.listPronote")) {
          $scope.accountList = UserFactory.getPronoteAccount();
        } else {
          $state.go("app.listPronote");
        }
      });
    });
  });
