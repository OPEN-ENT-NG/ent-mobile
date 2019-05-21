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
    $ionicLoading,
    $cordovaVibration,
    $ionicPlatform,
    $ionicHistory
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

      $scope.checkable = false;
      $scope.folders = [];
      $scope.folders = MessagerieServices.getNonPersonalFolders();
      $scope.folders.push({
        id: "0",
        name: ""
      });
      MessagerieServices.getCustomFolders()
        .then(function(resp) {
          for (var i = 0; i < resp.data.length; i++) {
            $scope.folders.push({
              id: resp.data[i].id,
              name: resp.data[i].name
            });
          }
        })
        .then(
          function() {
            var folderIds = [];
            angular.forEach($scope.folders, function(folder) {
              folderIds.push(folder.id);
            });
            MessagerieServices.getCountUnread(folderIds).then(function(
              response
            ) {
              for (var i = 0; i < response.length; i++) {
                console.log($scope.folders[i].name);
                console.log(response[i].count);
                $scope.folders[i].count = response[i].count;
              }
              initCheckedValue();
              console.log($scope.folders);
              $ionicLoading.hide();
            });
          },
          function() {
            $ionicLoading.hide();
          }
        );
    }

    function initCheckedValue() {
      angular.forEach($scope.folders, function(folder) {
        folder.checked = false;
      });
    }
  });
