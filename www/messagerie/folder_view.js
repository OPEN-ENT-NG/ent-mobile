angular
  .module("ent.messagerie", [
    "ent.message_services",
    "ent.message_folder",
    "ent.message_detail",
    "ent.new_message",
  ])

  .controller("MessagerieFoldersCtrl", function (
    $scope,
    $state,
    $rootScope,
    MessagerieServices,
    $ionicLoading,
    $ionicPlatform,
    $q
  ) {
    $ionicPlatform.ready(function () {
      $scope.$on("$ionicView.enter", getFolders);
    });

    $rootScope.getNameFolder = function (nameFolder) {
      var nonPersonnalFolders = ["inbox", "outbox", "draft", "trash"];
      return nonPersonnalFolders.indexOf(nameFolder) != -1
        ? $rootScope.translationConversation[nameFolder]
        : nameFolder;
    };

    $rootScope.newMail = function () {
      $state.go("app.new_message");
    };

    $scope.doRefreshFolders = function () {
      $scope.folders.unshift(getFolders());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.goToFolder = function (folder) {
      $state.go("app.message_folder", {
        nameFolder: folder.name,
        idFolder: folder.id,
      });
    };

    function getCountFolders(folders) {
      return $q.all(
        folders.map((folder) => {
          return MessagerieServices.getCount(folder.id, true).then(
            ({ data }) => (folder.count = data.count)
          );
        })
      );
    }

    function getFolders() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      $scope.folders = [];
      $scope.folders = MessagerieServices.getNonPersonalFolders();
      $scope.folders.push({
        id: "0",
        name: "",
      });
      MessagerieServices.getFolders()
        .then(({ data }) => {
          $scope.folders = spreadArray($scope.folders, data);

          getCountFolders(
            $scope.folders.filter(
              (folder) => folder.id != "DRAFT" && folder.id != "OUTBOX"
            )
          );
        })
        .catch(console.log)
        .finally($ionicLoading.hide);
    }
  });
