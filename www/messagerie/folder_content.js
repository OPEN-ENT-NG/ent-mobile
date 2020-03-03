angular
  .module("ent.message_folder", ["ent.message_services"])

  .controller("InboxCtrl", function(
    $scope,
    $state,
    $stateParams,
    $ionicPlatform,
    $rootScope,
    MessagerieServices,
    $ionicLoading,
    $ionicPopover,
    $ionicScrollDelegate,
    MoveMessagesPopupFactory,
    PopupFactory,
    $ionicListDelegate
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        $scope.page = 0;
        $scope.messages = [];
        $scope.extraFolders = [];
        $scope.endReached = false;
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        getMessagesAndFolders().then($ionicLoading.hide, err => {
          console.log(err);
          $ionicLoading.hide();
        });
      });

      $scope.$on("$ionicView.beforeEnter", function() {
        $ionicPopover
          .fromTemplateUrl("messagerie/popover_messagerie_folder.html", {
            scope: $scope
          })
          .then(function(popover) {
            $scope.popover = popover;
          });
      });
    });

    $scope.getRealName = (id, displayNames) => {
      const foundUser = displayNames.find(user => id == user[0]);
      return foundUser ? foundUser[1] : "Inconnu";
    };

    $scope.getMailTitle = mail => {
      if (
        $stateParams.idFolder !== "OUTBOX" &&
        (includesUser(mail.to) ||
        includesUser(mail.cc)||
        includesUser(mail.cci)) &&
        mail.state === "SENT"
      ) {
        return [mail.from];
      } else if (
        ($stateParams.idFolder !== "INBOX" &&
          mail.from == $rootScope.myUser.userId &&
          mail.state === "SENT") ||
        (mail.from === $rootScope.myUser.userId && mail.state === "DRAFT")
      ) {
        return mail.to;
      } else {
        return [];
      }
    };

    const includesUser = collection => {
      return collection.includes($rootScope.myUser.userId) || $rootScope.myUser.groupsIds.some(groupId => collection.includes(groupId))
    }

    $scope.getUnreadMessage = mail => {
      return (
        mail.unread &&
        (mail.from != $rootScope.myUser.userId ||
          mail.cc.includes($rootScope.myUser.userId) ||
          mail.cci.includes($rootScope.myUser.userId) ||
          mail.to.includes($rootScope.myUser.userId)) &&
        $stateParams.idFolder != "OUTBOX" &&
        $stateParams.idFolder != "DRAFT"
      );
    };

    $scope.restoreMessages = function() {
      let finalFct = () => {
        $ionicListDelegate.closeOptionButtons();
        $ionicLoading.hide();
      };
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.restoreSelectedMessages(getSelectedMessages()).then(
        () => {
          getMessagesAndFolders();
          finalFct();
        },
        err => {
          console.log(err);
          finalFct();
        }
      );
    };

    $scope.canShowRestore = function() {
      return (
        $stateParams.nameFolder.toUpperCase() == "TRASH" &&
        $scope.isCheckEnabled()
      );
    };

    $scope.showPopupMove = function() {
      let finalFct = () => {
        $ionicListDelegate.closeOptionButtons();
        $ionicLoading.hide();
      };
      MoveMessagesPopupFactory.getPopup($scope).then(function(res) {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        if (res != null) {
          MessagerieServices.moveMessages(getSelectedMessages(), res).then(
            () => {
              getMessagesAndFolders();
              finalFct();
            },
            err => {
              console.log(err);
              finalFct();
            }
          );
        } else {
          finalFct();
        }
      });
    };

    $rootScope.newMail = function() {
      $state.go("app.new_message");
    };

    $scope.deleteMessages = function(mails) {
      let finalFct = () => {
        $ionicListDelegate.closeOptionButtons();
        $ionicLoading.hide();
      };

      PopupFactory.getConfirmPopup(
        $rootScope.translationConversation["delete"],
        "Êtes-vous sûr(e) de vouloir supprimer ce(s) message(s) ?"
      ).then(res => {
        if (res) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });
          mails = Array.isArray(mails) ? mails : [mails];
          MessagerieServices.deleteSelectedMessages(
            mails,
            $stateParams.nameFolder
          ).then(
            () => {
              getMessages();
              finalFct();
            },
            err => {
              console.log(err);
              finalFct();
            }
          );
        }
      });
    };

    $scope.deleteSelectedMessages = function() {
      var messagesList = getSelectedMessages();
      if (messagesList.length > 0) {
        return $scope.deleteMessages(messagesList);
      }
    };

    $scope.loadMore = function() {
      MessagerieServices.getMessages(
        $stateParams.idFolder,
        $scope.page + 1
      ).then(
        ({ data }) => {
          $scope.messages = [...$scope.messages, ...data];
          $scope.page++;
          if (data.length < 25) {
            $scope.endReached = true;
          }
          $scope.$broadcast("scroll.infiniteScrollComplete");
        },
        err => {
          console.log(err);
          $scope.$broadcast("scroll.infiniteScrollComplete");
        }
      );
    };

    $scope.$watch(
      () => $scope.isCheckEnabled(),
      () => {
        if ($scope.isCheckEnabled()) {
          navigator.vibrate(100); // Vibrate 100ms
        }
      }
    );

    $rootScope.getCheckedNumber = function() {
      return getSelectedMessages().length;
    };

    $scope.checkAllMessages = function() {
      let allChecked = $scope.allChecked();
      $scope.messages.forEach(msg => (msg.checked = !allChecked));
    };

    $scope.allChecked = function() {
      return $scope.messages.every(msg => msg.checked == true);
    };

    function getSelectedMessages() {
      return $scope.messages
        ? $scope.messages.filter(mess => mess.checked)
        : [];
    }

    $scope.isCheckEnabled = function() {
      return $scope.messages
        ? $scope.messages.some(mess => mess.checked)
        : false;
    };

    $scope.getTitle = function() {
      return $scope.isCheckEnabled()
        ? $stateParams.nameFolder
        : $rootScope.getCheckedNumber();
    };

    $scope.doRefreshMessages = function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      getMessagesAndFolders().then(
        () => {
          $scope.$broadcast("scroll.refreshComplete");
          $ionicLoading.hide();
        },
        err => {
          console.log(err);
          $ionicLoading.hide();
        }
      );
    };

    function getMessagesAndFolders() {
      $scope.nameFolder = $stateParams.nameFolder;
      return Promise.all([getMessages(), getExtraFolders()]);
    }

    function getMessages() {
      return MessagerieServices.getMessages($stateParams.idFolder, 0).then(
        ({ data }) => {
          $ionicScrollDelegate.scrollTop();
          $scope.messages = data;
          $scope.page = 0;
          $scope.endReached = false;
        },
        Promise.reject
      );
    }

    function getExtraFolders() {
      return MessagerieServices.getFolders($stateParams.idFolder).then(
        ({ data }) => {
          $scope.extraFolders = data;
          return getCountFolders($scope.extraFolders);
        },
        Promise.reject
      );
    }

    function getCountFolders(folders) {
      return Promise.all(
        folders.map(folder => {
          return MessagerieServices.getCount(folder.id, true).then(
            ({ data }) => (folder.count = data.count)
          );
        })
      );
    }

    $scope.goToMessage = function(message) {
      $state.go("app.message_detail", {
        nameFolder: $stateParams.nameFolder,
        idMessage: message.id
      });
    };
  });
