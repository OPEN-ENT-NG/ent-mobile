angular
  .module("ent.workspace_file", ["ent.workspace_service"])

  .controller("WorkspaceFileCtlr", function(
    $scope,
    $rootScope,
    domainENT,
    WorkspaceService,
    $ionicLoading,
    $stateParams,
    $ionicHistory,
    $ionicPopover,
    $state,
    WorkspaceHelper,
    PopupFactory
  ) {
    var myUserRights = [];
    var isOwner = false;
    $scope.doc = $stateParams["file"];
    $scope.displayComments = false;
    getShareRights();

    console.log($scope.doc);
    $scope.doc.ownerPhoto = "/userbook/avatar/" + $scope.doc.owner;

    $scope.downloadDoc = function() {
      var docUrl = domainENT + "/workspace/document/" + $scope.doc._id;
      $rootScope.downloadFile($scope.doc.metadata.filename, docUrl);
    };

    $scope.goShare = function() {
      if ($scope.isRightToShare()) {
        $state.go("app.workspace_share", { ids: [$scope.doc._id] });
      }
    };

    $scope.commentDoc = function() {
      if ($scope.isRightToComment()) {
        PopupFactory.getPromptPopup(
          $rootScope.translationWorkspace["workspace.document.comment"],
          null,
          $rootScope.translationWorkspace["cancel"],
          $rootScope.translationWorkspace["workspace.comment"]
        ).then(function(res) {
          if (res) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"/>'
            });
            WorkspaceService.commentDocById($scope.doc._id, res).then(
              function(result) {
                updateDoc($scope.doc);
                $ionicLoading.hide();
              },
              function(err) {
                $ionicLoading.hide();
                PopupFactory.getCommonAlertPopup(err);
              }
            );
          }
        });
      }
    };

    $scope.renameDoc = function() {
      PopupFactory.getPromptPopup(
        $rootScope.translationWorkspace["workspace.rename"],
        null,
        $rootScope.translationWorkspace["cancel"],
        $rootScope.translationWorkspace["confirm"]
      ).then(function(res) {
        console.log(res);
        if (res) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });
          WorkspaceService.renameDoc($scope.doc._id, res).then(
            function(result) {
              updateDoc($scope.doc);
              $ionicLoading.hide();
            },
            function(err) {
              $ionicLoading.hide();
              PopupFactory.getCommonAlertPopup(err);
            }
          );
        }
      });
    };

    $scope.trashDoc = function(doc) {
      PopupFactory.getConfirmPopup(
        $rootScope.translationWorkspace["workspace.delete"],
        $rootScope.translationWorkspace["confirm.remove"],
        $rootScope.translationWorkspace["cancel"],
        $rootScope.translationWorkspace["confirm"]
      ).then(function(res) {
        if (res) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });
          WorkspaceService.trashDoc($scope.doc._id).then(
            function() {
              $ionicLoading.hide();
              $ionicHistory.clearCache();
              $ionicHistory.goBack();
            },
            function(err) {
              $ionicLoading.hide();
              PopupFactory.getCommonAlertPopup(err);
            }
          );
        }
      });
    };

    $scope.moveDoc = function() {
      $scope.closePopover();
      $state.go("app.workspace_movecopy", {
        items: WorkspaceHelper.getCheckedItemsId([$scope.doc]),
        action: "move"
      });
    };

    $scope.copyDoc = function() {
      $scope.closePopover();
      $state.go("app.workspace_movecopy", {
        items: WorkspaceHelper.getCheckedItemsId([$scope.doc]),
        action: "copy"
      });
    };

    // $scope.goVersion = function() {
    //   $scope.closePopover();
    //   $state.go("app.workspace_file_versions");
    // };

    $scope.isDocImage = function(metadata) {
      if (metadata == 0 || metadata == undefined) {
        return "false";
      }
      if (metadata["content-type"].indexOf("image") != -1) {
        return "true";
      }
      return "false";
    };

    $scope.getCountComments = function() {
      var text = "";
      if ($scope.displayComments) {
        text =
          $rootScope.translationWorkspace["workspace.document.comment.hide"];
      } else if ($scope.doc.comments) {
        text =
          $rootScope.translationWorkspace["workspace.document.comment.show"] +
          " (" +
          $scope.doc.comments.length +
          ")";
      }
      return text;
    };

    $scope.toggleComments = function() {
      $scope.displayComments = !$scope.displayComments;
    };

    $scope.isRightToUpdate = function() {
      if (isOwner) {
        return true;
      } else {
        for (var i = 0; i < myUserRights.length; i++) {
          if (
            myUserRights[i][
              "org-entcore-workspace-service-WorkspaceService|updateDocument"
            ]
          ) {
            return true;
          }
        }
      }
      return false;
    };

    $scope.isRightToDelete = function() {
      if (isOwner) {
        return true;
      } else {
        for (var i = 0; i < myUserRights.length; i++) {
          if (
            myUserRights[i][
              "org-entcore-workspace-service-WorkspaceService|moveTrash"
            ]
          ) {
            return true;
          }
        }
      }
      return false;
    };

    $scope.isRightToMove = function() {
      if (isOwner) {
        return true;
      } else {
        for (var i = 0; i < myUserRights.length; i++) {
          if (
            myUserRights[i][
              "org-entcore-workspace-service-WorkspaceService|moveDocuments"
            ]
          ) {
            return true;
          }
        }
      }
      return false;
    };

    $scope.isRightToShare = function() {
      if (isOwner) {
        return true;
      } else {
        for (var i = 0; i < myUserRights.length; i++) {
          if (
            myUserRights[i][
              "org-entcore-workspace-service-WorkspaceService|shareJson"
            ]
          ) {
            return true;
          }
        }
      }
      return false;
    };

    $scope.isRightToComment = function() {
      if (isOwner) {
        return true;
      } else {
        for (var i = 0; i < myUserRights.length; i++) {
          if (
            myUserRights[i][
              "org-entcore-workspace-service-WorkspaceService|commentDocument"
            ] ||
            myUserRights[i][
              "org-entcore-workspace-service-WorkspaceService|commentFolder"
            ]
          ) {
            return true;
          }
        }
      }
      return false;
    };

    $ionicPopover
      .fromTemplateUrl("workspace/popover_file.html", {
        scope: $scope
      })
      .then(function(popover) {
        $rootScope.popover = popover;
      });

    function updateDoc(doc) {
      WorkspaceService.getFiles(
        $stateParams["folderName"],
        $scope.doc.eParent
      ).then(function(res) {
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i]._id == doc._id) {
            $scope.doc = res.data[i];
            $scope.doc.test = doc.test;
          }
        }
      });
    }

    function getShareRights() {
      if ($scope.doc.owner == $rootScope.myUser.userId) {
        isOwner = true;
      } else {
        for (var i = 0; i < $scope.doc.shared.length; i++) {
          if (
            $scope.doc.shared[i].userId == $rootScope.myUser.userId ||
            $rootScope.myUser.groupsIds.some(function(id) {
              return id == $scope.doc.shared[i]["groupId"];
            })
          ) {
            myUserRights.push($scope.doc.shared[i]);
            break;
          }
        }
      }
    }
  });
