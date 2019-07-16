angular
  .module("ent.lvs", [])

  .controller("lvsCtrl", function(
    $scope,
    UserFactory,
    $ionicPlatform,
    $stateParams,
    $sce,
    $state,
    $ionicLoading,
    RequestService
  ) {
    $scope.noAccountError = "Pas de compte LVS disponible";
    $scope.accountListName = "Liste des comptes LVS";

    $scope.showConnecteur = function(link, name) {
      $state.go("app.lvs", {
        link: $sce.trustAsResourceUrl(link),
        name
      });
    };

    $scope.getAllAccounts = function() {
      UserFactory.getApplicationsList().then(() => {
        $scope.accountList = UserFactory.getLVSAccount();
      });
    };

    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        if ($state.is("app.lvs") && $stateParams.hasOwnProperty("link")) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });

          RequestService.get(
            $sce.getTrustedResourceUrl($stateParams.link)
          ).then(
            function success(response) {
              $scope.link = $sce.trustAsResourceUrl(response.data.link);
              $scope.name = $stateParams.name;

              document.querySelector("#iframe").onload = function() {
                $ionicLoading.hide();
              };
            },
            function error(err) {
              $ionicLoading.hide();
            }
          );
        } else if ($state.is("app.listLVS")) {
          $scope.accountList = UserFactory.getLVSAccount();
        } else {
          $state.go("app.listLVS");
        }
      });
    });
  });
