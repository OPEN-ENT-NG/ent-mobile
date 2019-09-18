var actionsName = {
  read: 3,
  contrib: 2,
  comment: 1,
  manager: 0
};

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
        $scope.items = {};
        $scope.contactShared = [];
        $scope.search = "";
        $scope.loader = {
          share: false
        };

        getData();
      });

      function getData() {
        for (let id of $stateParams["ids"]) {
          $scope.items[id] = {};
          WorkspaceService.getSharingItemDatas(id).then(({ data }) => {
            for (let action of data.actions) {
              $scope.items[id][action.displayName.split(".")[1]] = action.name;
            }
            if (Object.keys($scope.items).length === 1) {
              for (let group of data.groups.visibles) {
                $scope.addToShared(
                  {
                    ...group,
                    ...reverseRights($scope.items[id], data.groups.checked[group.id])
                  },
                  true
                );
              }
              for (let user of data.users.visibles) {
                $scope.addToShared(
                  {
                    ...user,
                    ...reverseRights($scope.items[id], data.users.checked[user.id])
                  },
                  false
                );
              }
            }
          });
        }
      }

      var getRights = (actions, share) => {
        let rightForShare = [];
        for (let action in actions) {
          if (share.hasOwnProperty(action) && share[action]) {
            rightForShare = [...rightForShare, ...actions[action]];
          }
        }
        return rightForShare || null;
      };

      var reverseRights = (actions, checked) => {
        let checkByAction = (action, checked) => {
          for (let right of action) {
            if (!checked.includes(right)) {
              return false;
            }
          }
          return true;
        };

        let result = {};

        for (let action in actions) {
          result[action] = checkByAction(actions[action], checked);
        }

        return result;
      };

      $scope.addToShared = (contact, isGroupParam) => {
        var contactContainsId = id => {
          for (let share of $scope.contactShared) {
            if (share.id === id) {
              return true;
            }
          }
          return false;
        };

        if (contactContainsId(contact.id)) {
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
            $stateParams["ids"][0],
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
        for (var i = 0; i < $scope.contactShared.length; i++) {
          if ($scope.contactShared[i].id == contactId) {
            $scope.contactShared[i].isSharingOpen = !$scope.contactShared[i]
              .isSharingOpen;
          } else {
            $scope.contactShared[i].isSharingOpen = false;
          }
        }
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
        for (let id in $scope.items) {
          let data = { users: {}, groups: {} };
          for (let contactShared of $scope.contactShared) {
            let subdata = contactShared.isGroup ? data.groups : data.users;
            let rights = getRights($scope.items[id], contactShared);
            if (rights.length > 0) {
              subdata[contactShared.id] = rights;
            }
          }

          WorkspaceService.updateSharingActions(id, data)
            .then(() => {
              $scope.loader.share = false;
              PopupFactory.getAlertPopupNoTitle(
                "Droits de partage mis à jour avec succès !"
              )
            })
            .catch(PopupFactory.getCommonAlertPopup)
            .finally(() => ($scope.loader.share = false));
        }
      };
    });
  });
