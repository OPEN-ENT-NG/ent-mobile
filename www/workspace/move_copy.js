angular
  .module("ent.workspace_move_file", ["ent.workspace_service", "ion-tree-list"])

  .controller("MoveCopyCtrl", function(
    $scope,
    $rootScope,
    WorkspaceService,
    $ionicHistory,
    $stateParams,
    $ionicPopup,
    CreateNewFolderPopUpFactory
  ) {
    /*
    
    {
    "_id": "96f7d843-9242-44f9-84be-368d54f5855f",
    "name": "yes",
    "application": "media-library",
    "shared": [],
    "inheritedShares": [],
    "eType": "folder",
    "created": "2018-12-13 15:51.21.335",
    "modified": "2018-12-13 15:51.21.335",
    "owner": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a",
    "ownerName": "ISABELLE POLONIO (prof arts plastiques)",
    "eParent": "d27dff3c-93ef-4d40-b133-ce54ce95e9f6",
    "parents": ["53f777c4-7a7d-4755-86f3-b866ec4ea6f7", "d27dff3c-93ef-4d40-b133-ce54ce95e9f6"]
}*/
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
      $scope
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
      $scope
        .getConfirmPopup(
          $rootScope.translationWorkspace["workspace.copy"],
          "Voulez-vous copier ce document dans le dossier " + item.name + "?",
          $rootScope.translationWorkspace["cancel"],
          "OK"
        )
        .then(function() {
          WorkspaceService.copyDocuments($stateParams["items"], item.id, {
            timeout: 10000
          }).then(
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
