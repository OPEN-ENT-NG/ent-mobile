angular
  .module("ent.workspace", [
    "ent.workspace_service",
    "ent.share_items",
    "ent.workspace_move_file",
    "ent.workspace_file"
  ])

  .controller("WorkspaceFolderContentCtlr", function(
    $scope,
    $rootScope,
    $ionicPlatform,
    $stateParams,
    $state,
    WorkspaceService,
    WorkspaceHelper,
    $ionicLoading,
    MimeTypeFactory,
    $ionicPopover,
    PopupFactory
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.beforeEnter", function() {
        $scope.checkable = false;

        $ionicPopover
          .fromTemplateUrl("workspace/popover_tree.html", {
            scope: $scope
          })
          .then(function(popover) {
            $scope.popover = popover;
          });

        if ($stateParams.hasIntent) {
          WorkspaceService.getTranslation().then(({ data }) => {
            $rootScope.translationWorkspace = data;
            getData($stateParams.hasIntent);
          });
        } else {
          getData();
        }
      });

      $scope.isMyDocuments = function() {
        return $stateParams["filter"] === "owner";
      };

      $scope.isShared = function() {
        return $stateParams["filter"] === "shared";
      };

      $scope.isApplis = function() {
        return $stateParams["filter"] === "protected";
      };

      $scope.isTrash = function() {
        return $stateParams["filter"] === "trash";
      };

      $scope.hasOnlyOneItemSelected = function() {
        return (
          WorkspaceHelper.getCheckedItems($scope.documents, $scope.folders)
            .length == 1
        );
      };

      $scope.hasRight = function(right) {
        let rightKey = "";
        switch (right) {
          case "manage": {
            rightKey =
              "org-entcore-workspace-controllers-WorkspaceController|deleteDocument";
            break;
          }
          case "share": {
            rightKey =
              "org-entcore-workspace-controllers-WorkspaceController|shareJson";
            break;
          }
          default: {
            return false;
          }
        }

        let checkIdInShares = (shares, ids, right) => {
          for (let share of shares) {
            for (let id of ids) {
              if ((share.userId == id || share.groupId == id) && share[right]) {
                return true;
              }
            }
          }
          return false;
        };

        var itemsChecked = WorkspaceHelper.getCheckedItems(
          $scope.documents,
          $scope.folders
        );
        if (itemsChecked && itemsChecked.length > 0) {
          for (let item of itemsChecked) {
            if (item.owner === $rootScope.myUser.userId) {
              return true;
            } else if (
              !checkIdInShares(
                item.shared,
                [$rootScope.myUser.userId],
                rightKey
              ) &&
              !checkIdInShares(
                item.shared,
                $rootScope.myUser.groupsIds,
                rightKey
              )
            ) {
              return false;
            }
          }
          return true;
        }
      };

      $rootScope.areCommentsShown = function(folder) {
        return $rootScope.shownComments === folder;
      };

      $rootScope.getCopyExpression = function() {
        if ($scope.isMyDocuments()) {
          return $rootScope.translationWorkspace["workspace.copy"];
        } else {
          return $rootScope.translationWorkspace["workspace.move.racktodocs"];
        }
      };

      $scope.enableCheck = function(item) {
        if (!$scope.checkable) {
          navigator.vibrate(100); // Vibrate 100ms
          $scope.checkable = true;
          item.checked = true;
        }
      };

      $scope.shouldDisableCheckable = function() {
        if (
          WorkspaceHelper.getCheckedItems($scope.folders, $scope.documents)
            .length === 0
        ) {
          $scope.checkable = false;
        }
      };

      $scope.newFolder = function() {
        PopupFactory.getPromptPopup(
          $rootScope.translationWorkspace["folder.new.title"],
          null,
          $rootScope.translationWorkspace["cancel"],
          $rootScope.translationWorkspace["workspace.folder.create"]
        ).then(name => {
          if (name) {
            WorkspaceService.createFolder(name, $stateParams["folderId"])
              .then(getData)
              .catch(PopupFactory.getCommonAlertPopup)
              .finally($ionicLoading.hide);
          }
        });
      };

      $scope.addDocument = function(ele) {
        var newDoc = ele.files[0];

        if (newDoc.size > $rootScope.translationWorkspace["max.file.size"]) {
          PopupFactory.getAlertPopupNoTitle(
            $rootScope.translationWorkspace["file.too.large.limit"] +
              $scope.getSizeFile(
                parseInt($rootScope.translationWorkspace["max.file.size"])
              )
          );
        } else {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });

          var formData = new FormData();
          formData.append("file", newDoc);
          WorkspaceService.uploadDoc(formData, $stateParams["folderId"])
            .then(getData)
            .catch(PopupFactory.getCommonAlertPopup)
            .finally($ionicLoading.hide);
        }
      };

      $scope.doRefresh = function() {
        getData();
        $scope.$broadcast("scroll.refreshComplete");
        $scope.$apply();
      };

      $scope.getTitle = function() {
        if ($scope.checkable) {
          return WorkspaceHelper.getCheckedItems(
            $scope.folders,
            $scope.documents
          ).length;
        } else if ($stateParams["folderId"]) {
          return $stateParams["folderName"];
        } else if ($scope.isMyDocuments()) {
          return $rootScope.translationWorkspace["documents"];
        } else if ($scope.isApplis()) {
          return $rootScope.translationWorkspace["appDocuments"];
        } else {
          return $rootScope.translationWorkspace[$stateParams["filter"]];
        }
      };

      $scope.gotInDepthFolder = function(folder) {
        $state.go("app.workspace_tree", {
          folderId: folder._id,
          folderName: folder.name
        });
      };

      $scope.goToFile = function(doc) {
        $state.go("app.workspace_file", {
          file: doc,
          parentId: $stateParams["folderId"],
          parentName: $scope.getTitle(),
          filter: $stateParams["filter"]
        });
      };

      $scope.deleteSelectedItems = function() {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        $scope.popover.hide();

        let fct = $scope.isTrash()
          ? WorkspaceService.deleteDocuments
          : WorkspaceService.trashDocuments;

        fct(WorkspaceHelper.getCheckedItemsId($scope.folders, $scope.documents))
          .then(getData)
          .catch(PopupFactory.getCommonAlertPopup)
          .finally($ionicLoading.hide);
      };

      $scope.restoreSelectedItems = function() {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        $scope.popover.hide();
        WorkspaceService.restoreDocuments(
          WorkspaceHelper.getCheckedItemsId($scope.folders, $scope.documents)
        )
          .then(getData)
          .catch(PopupFactory.getCommonAlertPopup)
          .finally($ionicLoading.hide);
      };

      $scope.renameItem = function() {
        let item = WorkspaceHelper.getCheckedItems(
          $scope.folders,
          $scope.documents
        );
        if (item.length === 1) {
          item = item[0];

          PopupFactory.getPromptPopup(
            $rootScope.translationWorkspace["workspace.rename"],
            null,
            $rootScope.translationWorkspace["cancel"],
            $rootScope.translationWorkspace["confirm"]
          ).then(function(resp) {
            if (resp) {
              WorkspaceService.renameDocument(item, resp)
                .then(getData)
                .catch(PopupFactory.getCommonAlertPopup)
                .finally($ionicLoading.hide);
            }
          });
        }
      };

      $scope.copySelectedItems = function() {
        $scope.popover.hide();
        $scope.checkable = false;
        $state.go("app.workspace_movecopy", {
          items: WorkspaceHelper.getCheckedItemsId(
            $scope.folders,
            $scope.documents
          ),
          action: "copy"
        });
      };

      $scope.moveSelectedItems = function() {
        $scope.popover.hide();
        $scope.checkable = false;
        $state.go("app.workspace_movecopy", {
          items: WorkspaceHelper.getCheckedItemsId(
            $scope.folders,
            $scope.documents
          ),
          action: "move"
        });
      };

      $scope.shareSelectedItems = function() {
        $scope.popover.hide();
        $scope.checkable = false;
        $state.go("app.workspace_share", {
          ids: WorkspaceHelper.getCheckedItemsId(
            $scope.folders,
            $scope.documents
          )
        });
      };

      function getData(hasIntent) {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });

        $scope.checkable = false;
        $scope.documents = [];
        $scope.folders = [];

        filter = $stateParams["filter"];
        parentId = $stateParams["folderId"];

        const promises = [];

        promises.push(
          WorkspaceService.getFolders({ filter, parentId }).then(res => {
            for (var i = 0; i < res.data.length; i++) {
              $scope.folders.push({ ...res.data[i], checked: false });
            }
          })
        );

        promises.push(
          WorkspaceService.getFiles({ filter, parentId }).then(result => {
            for (var i = 0; i < result.data.length; i++) {
              $scope.documents.push({
                ...MimeTypeFactory.setIcons(result.data[i]),
                checked: false
              });
            }
          })
        );

        return Promise.all(promises)
          .catch(PopupFactory.getCommonAlertPopup)
          .finally(() => {
            if (!hasIntent) $ionicLoading.hide();
          });
      }

      $scope.isDocImage = function(metadata) {
        if (metadata == 0 || metadata == undefined) {
          return "false";
        }
        if (metadata["content-type"].indexOf("image") != -1) {
          return "true";
        }
        return "false";
      };

      $rootScope.$on("FileUploaded", () => {
        getData();
      });
    });
  });
