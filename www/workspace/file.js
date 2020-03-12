angular
  .module("ent.workspace_file", ["ent.workspace_service"])

  .controller("WorkspaceFileCtlr", function(
    $scope,
    $ionicPlatform,
    $rootScope,
    domainENT,
    FileService,
    WorkspaceService,
    $ionicLoading,
    $stateParams,
    $ionicHistory,
    $ionicPopover,
    $state,
    PopupFactory
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.beforeEnter", function() {
        $scope.myUserRights = [];
        $scope.isOwner = false;
        $scope.doc = $stateParams["file"];
        $scope.displayComments = false;
        getShareRights();

        $ionicPopover
          .fromTemplateUrl("workspace/popover_file.html", {
            scope: $scope
          })
          .then(function(popover) {
            $scope.popover = popover;
          });

        console.log($scope.doc);
        $scope.doc.ownerPhoto = "/userbook/avatar/" + $scope.doc.owner;
      });

      $scope.downloadDoc = function() {
        var docUrl = domainENT + "/workspace/document/" + $scope.doc._id;
        FileService.getFile($scope.doc.metadata.filename, docUrl);
      };

      $scope.goShare = function() {
        if ($scope.isRightToShare()) {
          $state.go("app.workspace_share", { files: [$scope.doc] });
        }
      };

      $scope.getTitle = function() {
        return $stateParams["parentName"];
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
              WorkspaceService.commentDocById($scope.doc._id, res)
                .then(() => updateDoc($scope.doc))
                .catch(PopupFactory.getCommonAlertPopup)
                .finally($ionicLoading.hide);
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
        $scope.popover.hide();
        $state.go("app.workspace_movecopy", {
          items: [$scope.doc._id],
          action: "move"
        });
      };

      $scope.copyDoc = function() {
        $scope.popover.hide();
        $state.go("app.workspace_movecopy", {
          items: [$scope.doc._id],
          action: "copy"
        });
      };

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
        if ($scope.isOwner) {
          return true;
        } else {
          for (var i = 0; i < $scope.myUserRights.length; i++) {
            if (
              $scope.myUserRights[i][
                "org-entcore-workspace-controllers-WorkspaceController|updateDocument"
              ]
            ) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.isRightToDelete = function() {
        if ($scope.isOwner) {
          return true;
        } else {
          for (var i = 0; i < $scope.myUserRights.length; i++) {
            if (
              $scope.myUserRights[i][
                "org-entcore-workspace-controllers-WorkspaceController|moveTrash"
              ]
            ) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.isRightToMove = function() {
        if ($scope.isOwner) {
          return true;
        } else {
          for (var i = 0; i < $scope.myUserRights.length; i++) {
            if (
              $scope.myUserRights[i][
                "org-entcore-workspace-controllers-WorkspaceController|moveDocuments"
              ]
            ) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.isRightToShare = function() {
        if ($scope.isApplis()) {
          return false;
        } else if ($scope.isOwner) {
          return true;
        } else {
          for (var i = 0; i < $scope.myUserRights.length; i++) {
            if (
              $scope.myUserRights[i][
                "org-entcore-workspace-controllers-WorkspaceController|shareJson"
              ]
            ) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.isApplis = function() {
        return $stateParams["filter"] == "protected";
      };

      $scope.isRightToComment = function() {
        if ($scope.isApplis()) {
          return false;
        } else if ($scope.isOwner) {
          return true;
        } else {
          for (var i = 0; i < $scope.myUserRights.length; i++) {
            if (
              $scope.myUserRights[i][
                "org-entcore-workspace-controllers-WorkspaceController|commentDocument"
              ] ||
              $scope.myUserRights[i][
                "org-entcore-workspace-controllers-WorkspaceController|commentFolder"
              ]
            ) {
              return true;
            }
          }
        }
        return false;
      };

      function updateDoc(doc) {
        WorkspaceService.getFiles({
          filter: $stateParams["filter"],
          parentId: $stateParams["parentId"]
        }).then(function(res) {
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
          $scope.isOwner = true;
        } else {
          for (var i = 0; i < $scope.doc.inheritedShares.length; i++) {
            if (
              $scope.doc.inheritedShares[i].userId ==
                $rootScope.myUser.userId ||
              $rootScope.myUser.groupsIds.some(function(id) {
                return id == $scope.doc.inheritedShares[i]["groupId"];
              })
            ) {
              $scope.myUserRights.push($scope.doc.inheritedShares[i]);
              break;
            }
          }
        }
      }
    });
  });
