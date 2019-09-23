angular
  .module("ent.messagerie", [
    "ent.message_services",
    "ent.message_folder",
    "ent.message_detail",
    "ent.new_message"
  ])

  .controller("MessagerieFoldersCtrl", function(
    $scope,
    $state,
    $rootScope,
    MessagerieServices,
    $ionicLoading
  ) {
    getFolders();

    $rootScope.getNameFolder = function(nameFolder) {
      var nonPersonnalFolders = ["inbox", "outbox", "draft", "trash"];
      return nonPersonnalFolders.indexOf(nameFolder) != -1
        ? $rootScope.translationConversation[nameFolder]
        : nameFolder;
    };

    $rootScope.newMail = function() {
      $state.go("app.new_message");
    };

    $scope.doRefreshFolders = function() {
      $scope.folders.unshift(getFolders());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.goToFolder = function(folder) {
      $state.go("app.message_folder", {
        nameFolder: folder.name,
        idFolder: folder.id
      });
    };

    function getFolders() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      $scope.folders = [];
      $scope.folders = MessagerieServices.getNonPersonalFolders();
      $scope.folders.push({
        id: "0",
        name: ""
      });
      MessagerieServices.getFolders().then(
        ({ data }) => {
          $scope.folders = [...$scope.folders, ...data];
          Promise.all(
            $scope.folders.filter(folder => folder.id != "DRAFT" && folder.id != "OUTBOX").map(folder => {
              return MessagerieServices.getCount(
                folder.id,
                folder.id.toUpperCase() != "DRAFT"
              ).then(({ data }) => (folder.count = data.count));
            })
          ).then(
            () => {
              $ionicLoading.hide();
            },
            err => {
              console.log(err);
              $ionicLoading.hide();
            }
          );
        },
        err => {
          console.log(err);
          $ionicLoading.hide();
        }
      );
    }
  });
