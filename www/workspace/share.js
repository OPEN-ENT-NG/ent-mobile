angular
  .module("ent.share_items", ["ent.workspace_service", "ent.message_services"])

  .controller("ShareItemController", function(
    $scope,
    $stateParams,
    WorkspaceService,
    $rootScope,
    $ionicPlatform,
    PopupFactory
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.beforeEnter", function() {
        $scope.items = $stateParams["files"];
        $scope.actions = {};
        $scope.contactShared = [];
        $scope.search = "";

        $scope.loader = {
          share: false
        };

        if (Object.keys($scope.items).length > 1) {
          PopupFactory.getAlertPopupNoTitle(
            "Attention, vous allez modifier des droits de partage sur plusieurs objets : tous les objets sélectionnés seront affectés et disposeront uniquement du nouveau partage."
          );
          getData(false);
        } else {
          getData(true);
        }
      });

      function getData(shouldLoadShare) {
        WorkspaceService.getSharingItemDatas($scope.items[0]._id).then(
          ({ data }) => {
            for (let action of data.actions) {
              $scope.actions[action.displayName.split(".")[1]] = action.name;
            }

            if (shouldLoadShare) {
              for (let group of data.groups.visibles) {
                $scope.addToShared(
                  {
                    ...group,
                    ...reverseRights(data.groups.checked[group.id])
                  },
                  true
                );
              }

              for (let user of data.users.visibles) {
                $scope.addToShared(
                  {
                    ...user,
                    ...reverseRights(data.users.checked[user.id])
                  },
                  false
                );
              }
            }
          }
        );
      }

      var getRights = contact => {
        let rightForShare = [];
        for (let action in $scope.actions) {
          if (contact.hasOwnProperty(action) && contact[action]) {
            rightForShare = [...rightForShare, ...$scope.actions[action]];
          }
        }
        return rightForShare || null;
      };

      var reverseRights = (userRights) => {
        let checkByAction = (rights, userRights) => {
          for (let right of rights) {
            if (!userRights.includes(right)) {
              return false;
            }
          }
          return true;
        };

        let result = {};

        for (let rightName in $scope.actions) {
          result[rightName] = checkByAction($scope.actions[rightName], userRights);
        }

        return result;
      };

      $scope.addToShared = (contact, isGroupParam) => {
        if ($scope.contactShared.some(item => item.id == contact.id)) {
          $scope.search = "";
          return;
        }

        let isGroup = isGroupParam || contact.isGroup;
        let data = {
          read: true,
          comment: true,
          ...contact,
          isGroup
        };

        if (!isGroup) {
          data.profile = $rootScope.translationUser[contact.profile];
        }

        $scope.contactShared.push(data);
        $scope.search = "";
      };

      $scope.updateSearch = search => {
        $scope.search = search;
        if ($scope.search.length) {
          $scope.contacts = [];

          WorkspaceService.getSharingItemDatas(
            $scope.items[0]._id,
            $scope.search
          ).then(({ data }) => {
            for (let group of data.groups.visibles) {
              if (group.name.includes($scope.search)) {
                $scope.contacts.push({
                  ...group,
                  isGroup: true,
                  displayName: group.name
                });
              }
            }
            for (let user of data.users.visibles) {
              if (user.username.includes($scope.search)) {
                $scope.contacts.push({
                  ...user,
                  isGroup: false,
                  profile: $rootScope.translationWorkspace[user.profile],
                  displayName: user.username
                });
              }
            }
          });
        }
      };

      $scope.openSharing = function(contactId) {
        $scope.contactShared.forEach(
          contact =>
            (contact.isSharingOpen =
              contact.id == contactId ? !contact.isSharingOpen : false)
        );
      };

      $scope.modifyCheckValues = function(contactShared, right) {
        if (right == "read") {
          if (!contactShared.read) {
            contactShared.contrib = false;
            contactShared.manager = false;
            contactShared.comment = false;
          }
        } else if (right == "contrib") {
          if (!contactShared.contrib) {
            contactShared.manager = false;
          } else {
            contactShared.read = true;
          }
        } else if (right == "manager") {
          if (contactShared.manager) {
            contactShared.read = true;
            contactShared.contrib = true;
          }
        } else if (right == "comment") {
          if (contactShared.comment) {
            contactShared.read = true;
          }
        }
      };

      $scope.saveSharing = function() {
        $scope.loader.share = true;

        for (const file of $scope.items) {
          let data = { users: {}, groups: {} };

          for (let contactShared of $scope.contactShared) {
            let subdata = contactShared.isGroup ? data.groups : data.users;
            let rights = getRights(contactShared);
            if (rights.length > 0) {
              subdata[contactShared.id] = rights;
            }
          }

          if (file.owner !== $rootScope.myUser.userId) {
            data.users[$rootScope.myUser.userId] = getRights({
              contrib: true,
              comment: true,
              manager: true,
              read: true
            });
          }

          WorkspaceService.updateSharingActions(file._id, data)
            .then(() => {
              $scope.loader.share = false;
              PopupFactory.getAlertPopupNoTitle(
                "Droits de partage mis à jour avec succès !"
              );
            })
            .catch(PopupFactory.getCommonAlertPopup)
            .finally(() => ($scope.loader.share = false));
        }
      };
    });
  });
