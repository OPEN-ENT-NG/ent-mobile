angular
  .module("ent.workspace_move_file", ["ent.workspace_service", "ion-tree-list"])

  .controller("MoveCopyCtrl", function(
    $scope,
    $rootScope,
    WorkspaceService,
    $ionicHistory,
    $stateParams,
    $ionicPopup,
    CreateNewFolderPopUpFactory,
    getPopupFactory
  ) {
    choosenFolder = null;
    getData();

    function getData() {
      var buildRecursiveTree = (parent, folders) => {
        let result = [];

        folders.forEach(folder => {
          if (folder.eParent == parent) {
            result.push({
              id: folder._id,
              name: folder.name,
              tree: buildRecursiveTree(folder._id, folders),
              checked: false
            });
          }
        });
        return result;
      };

      WorkspaceService.getFolders({
        filter: "owner",
        hierarchical: true
      }).then(res => {
        $scope.tasks = [
          {
            id: null,
            name: $rootScope.translationWorkspace["documents"],
            tree: buildRecursiveTree(null, res.data),
            checked: false
          }
        ];
      });
    }

    $scope.$on("$ionTreeList:ItemClicked", function(event, item) {
      choosenFolder = item;
    });

    $scope.newFolder = function() {
      CreateNewFolderPopUpFactory.getPopup($scope).then(name => {
        WorkspaceService.createFolder(name, $stateParams["folderId"]).then(
          getData,
          err => {
            var title = "Erreur de connexion";
            var template = $rootScope.translationWorkspace[err];
            return $ionicPopup.alert({
              title: title,
              template: template
            });
          }
        );
      });
    };

    function moveItem(item) {
      getPopupFactory
        .getConfirmPopup(
          $rootScope.translationWorkspace["move"],
          "Voulez-vous déplacer ce document dans le dossier " + item.name + "?",
          $rootScope.translationWorkspace["cancel"],
          "OK"
        )
        .then(function() {
          WorkspaceService.moveDocuments($stateParams["items"], item.id).then(
            () => $ionicHistory.goBack(),
            err => $scope.showAlertError(err)
          );
        });
    }

    function copyItem(item) {
      getPopupFactory
        .getConfirmPopup(
          $rootScope.translationWorkspace["workspace.copy"],
          "Voulez-vous copier ce document dans le dossier " + item.name + "?",
          $rootScope.translationWorkspace["cancel"],
          "OK"
        )
        .then(function() {
          WorkspaceService.copyDocuments($stateParams["items"], item.id).then(
            () => $ionicHistory.goBack(),
            err => $scope.showAlertError(err)
          );
        });
    }

    $scope.getTitle = function() {
      return $rootScope.translationWorkspace[
        "workspace." + $stateParams.action
      ];
    };

    $scope.selectFolder = function() {
      switch ($stateParams.action) {
        case "move":
          moveItem(choosenFolder);
          break;
        case "copy":
          copyItem(choosenFolder);
          break;
        default:
          break;
      }
    };
  });
