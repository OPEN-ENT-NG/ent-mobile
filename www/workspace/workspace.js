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
    $stateParams,
    $state,
    WorkspaceService,
    WorkspaceHelper,
    $ionicLoading,
    MimeTypeFactory,
    CreateNewFolderPopUpFactory,
    $ionicPopup,
    $cordovaVibration,
    $ionicPopover,
    RenamePopUpFactory,
    getPopupFactory
  ) {
    $scope.$on("$ionicView.beforeEnter", function() {
      $scope.checkable = false;
      getData();
    });

    $scope.isMyDocuments = function() {
      return $stateParams["filter"] === "owner";
    };

    $scope.isShared = function() {
      return $stateParams["filter"] === "shared";
    };

    $scope.isTrash = function() {
      return $stateParams["filter"] === "trash";
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
          if (item.owner === $rootScope.myUser.id) {
            return true;
          } else if (
            !checkIdInShares(item.shared, [$rootScope.myUser.id], rightKey) &&
            !checkIdInShares(item.shared, $rootScope.myUser.groupsIds, rightKey)
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
        $cordovaVibration.vibrate(100); // Vibrate 100ms
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
      CreateNewFolderPopUpFactory.getPopup($scope).then(name => {
        WorkspaceService.createFolder(name, $stateParams["folderId"]).then(
          getData(),
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

    $scope.addDocument = function(ele) {
      var newDoc = ele.files[0];

      if (newDoc.size > $rootScope.translationWorkspace["max.file.size"]) {
        getPopupFactory.getAlertPopupNoTitle(
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
        WorkspaceService.uploadDoc(formData, $stateParams["folderId"]).then(
          function() {
            getData();
            $ionicLoading.hide();
          },
          function(err) {
            $ionicLoading.hide();
            $scope.showAlertError(err);
          }
        );
      }
    };

    $scope.doRefresh = function() {
      getData();
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.getTitle = function() {
      if ($scope.checkable) {
        return WorkspaceHelper.getCheckedItems($scope.folders, $scope.documents)
          .length;
      } else if ($stateParams["folderId"]) {
        return $stateParams["folderName"];
      } else if ($scope.isMyDocuments()) {
        return $rootScope.translationWorkspace["documents"];
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
        folderName: $stateParams["folderName"]
      });
    };

    $scope.deleteSelectedItems = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      $scope.closePopover();

      let fct = $scope.isTrash()
        ? WorkspaceService.deleteDocuments
        : WorkspaceService.trashDocuments;

      fct(
        WorkspaceHelper.getCheckedItemsId($scope.folders, $scope.documents)
      ).then(
        result => {
          console.log(result);
          getData();
          $scope.checkable = false;
        },
        error => {
          $ionicLoading.hide();
          $scope.showAlertError(error);
        }
      );
    };

    $scope.restoreSelectedItems = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      $scope.closePopover();
      WorkspaceService.restoreDocuments(
        WorkspaceHelper.getCheckedItemsId($scope.folders, $scope.documents)
      ).then(
        res => {
          console.log(res);
          $scope.checkable = false;
          getData();
          $ionicLoading.hide();
        },
        err => {
          $ionicLoading.hide();
          $scope.showAlertError(err);
        }
      );
    };

    $scope.renameItem = function() {
      let item = WorkspaceHelper.getCheckedItems(
        $scope.folders,
        $scope.documents
      );
      if (item.length === 1) {
        item = item[0];
        RenamePopUpFactory.getPopup($scope, item).then(function(resp) {
          WorkspaceService.renameDocument(item, resp).then(
            function(response) {
              console.log(response);
              $scope.closePopover();
              $scope.checkable = false;
              getData();
            },
            function(err) {
              $ionicLoading.hide();
              $scope.showAlertError(err);
            }
          );
        });
      }
    };

    $scope.copySelectedItems = function() {
      $scope.closePopover();
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
      $scope.closePopover();
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
      $scope.closePopover();
      $scope.checkable = false;
      $state.go("app.workspace_share", {
        ids: WorkspaceHelper.getCheckedItemsId($scope.folders, $scope.documents)
      });
    };

    $ionicPopover
      .fromTemplateUrl("workspace/popover_tree.html", {
        scope: $scope
      })
      .then(function(popover) {
        $rootScope.popover = popover;
      });

    function getData() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });

      let parameters = {
        filter: $stateParams["filter"],
        parentId: $stateParams["folderId"]
      };

      let folders = WorkspaceService.getFolders(parameters).then(res => {
        $scope.folders = [];
        for (var i = 0; i < res.data.length; i++) {
          $scope.folders.push({ ...res.data[i], checked: false });
        }
      });

      let docs = WorkspaceService.getFiles(parameters).then(result => {
        $scope.documents = [];
        for (var i = 0; i < result.data.length; i++) {
          $scope.documents.push({
            ...MimeTypeFactory.setIcons(result.data[i]),
            checked: false
          });
        }
      });

      Promise.all([folders, docs]).then($ionicLoading.hide, err => {
        $ionicLoading.hide();
        $scope.showAlertError(err);
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
  });
