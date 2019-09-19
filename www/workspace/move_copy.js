angular
  .module("ent.workspace_move_file", ["ent.workspace_service", "ion-tree-list"])

  .controller("MoveCopyCtrl", function(
    $scope,
    $rootScope,
    WorkspaceService,
    $ionicHistory,
    $stateParams,
    PopupFactory,
    $ionicPlatform,
    $ionicLoading
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.beforeEnter", function() {
        $scope.choosenFolder = null;
        handleAction(getData);
      });
    });

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

      return WorkspaceService.getFolders({
        filter: "owner",
        hierarchical: true
      }).then(res => {
        choosenFolder = null;

        $scope.tasks = [
          {
            id: null,
            name: $rootScope.translationWorkspace["documents"],
            tree: buildRecursiveTree(null, res.data),
            checked: false
          }
        ];
        return $scope.tasks;
      });
    }

    $scope.$on("$ionTreeList:ItemClicked", function(event, item) {
      $scope.choosenFolder = item;
    });

    $scope.newFolder = function() {
      PopupFactory.getPromptPopup(
        $rootScope.translationWorkspace["folder.new.title"],
        null,
        $rootScope.translationWorkspace["cancel"],
        $rootScope.translationWorkspace["workspace.folder.create"]
      ).then(name => {
        if (name) {
          handleAction(
            () => WorkspaceService.createFolder(name, $scope.choosenFolder.id),
            getData
          );
        }
      });
    };

    function moveItem(choosenFolder) {
      PopupFactory.getConfirmPopup(
        $rootScope.translationWorkspace["move"],
        "Voulez-vous déplacer ce document dans le dossier " +
          choosenFolder.name +
          "?",
        $rootScope.translationWorkspace["cancel"],
        "OK"
      ).then(answer => {
        if (answer) {
          handleAction(
            () =>
              WorkspaceService.moveDocuments(
                $stateParams["items"],
                choosenFolder.id || "root"
              ),
            () => $ionicHistory.goBack()
          );
        }
      });
    }

    function copyItem(choosenFolder) {
      PopupFactory.getConfirmPopup(
        $rootScope.translationWorkspace["workspace.copy"],
        "Voulez-vous copier ce document dans le dossier " +
          choosenFolder.name +
          "?",
        $rootScope.translationWorkspace["cancel"],
        "OK"
      ).then(answer => {
        if (answer) {
          handleAction(
            () =>
              WorkspaceService.copyDocuments(
                $stateParams["items"],
                choosenFolder.id || "root"
              ),
            () => $ionicHistory.goBack()
          );
        }
      });
    }

    function handleAction(service, successCallback) {
      if (successCallback == null) {
        successCallback = () => true;
      }

      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      service()
        .then(successCallback)
        .catch(PopupFactory.getCommonAlertPopup)
        .finally($ionicLoading.hide);
    }

    $scope.getTitle = function() {
      return $rootScope.translationWorkspace[
        "workspace." + $stateParams.action
      ];
    };

    $scope.selectFolder = function() {
      switch ($stateParams.action) {
        case "move":
          moveItem($scope.choosenFolder);
          break;
        case "copy":
          copyItem($scope.choosenFolder);
          break;
        default:
          break;
      }
    };
  });
