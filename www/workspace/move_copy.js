angular
  .module("ent.workspace_move_file", ["ent.workspace_service", "ion-tree-list"])

  .controller("MoveCopyCtrl", function(
    $scope,
    $rootScope,
    WorkspaceService,
    $ionicHistory,
    $stateParams,
    PopupFactory
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
      PopupFactory.getPromptPopup(
        $rootScope.translationWorkspace["folder.new.title"],
        null,
        $rootScope.translationWorkspace["folder.new"]
      ).then(name => {
        WorkspaceService.createFolder(name, $stateParams["folderId"]).then(
          getData,
          err => {
            PopupFactory.getAlertPopup(
              "Erreur de connexion",
              $rootScope.translationWorkspace[err]
            );
          }
        );
      });
    };

    function moveItem(item) {
      PopupFactory.getConfirmPopup(
        $rootScope.translationWorkspace["move"],
        "Voulez-vous déplacer ce document dans le dossier " + item.name + "?",
        $rootScope.translationWorkspace["cancel"],
        "OK"
      ).then(function() {
        WorkspaceService.moveDocuments($stateParams["items"], item.id).then(
          () => $ionicHistory.goBack(),
          err => PopupFactory.getCommonAlertPopup(err)
        );
      });
    }

    function copyItem(item) {
      PopupFactory.getConfirmPopup(
        $rootScope.translationWorkspace["workspace.copy"],
        "Voulez-vous copier ce document dans le dossier " + item.name + "?",
        $rootScope.translationWorkspace["cancel"],
        "OK"
      ).then(function() {
        WorkspaceService.copyDocuments($stateParams["items"], item.id).then(
          () => $ionicHistory.goBack(),
          err => PopupFactory.getCommonAlertPopup(err)
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
