angular
  .module("ent.message_detail", ["ent.message_services", "ent.messagerie"])

  .controller("MessagesDetailCtrl", function(
    $scope,
    $rootScope,
    $ionicPopover,
    $state,
    domainENT,
    MessagerieServices,
    $ionicLoading,
    $ionicHistory,
    DeleteMessagesPopupFactory,
    MoveMessagesPopupFactory,
    AlertMessagePopupFactory
  ) {
    getMessage();
    delete $rootScope.notification;

    $rootScope.getRealName = function(id, displayNames) {
      var returnName = "Inconnu";
      for (var i = 0; i < displayNames.length; i++) {
        if (id == displayNames[i][0]) {
          returnName = displayNames[i][1];
        }
      }
      return returnName;
    };

    $scope.isDraft = function() {
      return "draft" === $rootScope.nameFolder;
    };

    $scope.isInbox = function() {
      return ["outbox", "draft", "trash"].indexOf($rootScope.nameFolder) === -1;
    };

    $scope.isTrash = function() {
      return "trash" === $rootScope.nameFolder;
    };

    $rootScope.isPersonnalFolder = function(nameFolder) {
      var nonPersonnalFolders = ["inbox", "outbox", "draft", "trash"];
      console.log(nonPersonnalFolders.indexOf(nameFolder) != -1);
      return nonPersonnalFolders.indexOf(nameFolder) == -1;
    };

    $scope.trash = function() {
      DeleteMessagesPopupFactory.getPopup().then(function(res) {
        if (res) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });
          MessagerieServices.deleteSelectedMessages(
            [$scope.mail],
            $rootScope.nameFolder
          ).then(
            function() {
              $ionicLoading.hide();
              AlertMessagePopupFactory.getPopup(
                $rootScope.translationConversation["delete"],
                "Message(s) supprimé(s)"
              ).then(function() {
                $ionicHistory.clearCache();
                $ionicHistory.goBack();
              });
            },
            function() {
              $ionicLoading.hide();
            }
          );
        }
      });
    };

    $scope.moveMessage = function(message) {
      var popupMove = MoveMessagesPopupFactory.getPopup($scope);
      popupMove.then(function(res) {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });

        if (res != null) {
          MessagerieServices.moveMessages([message], res).then(function() {
            $ionicHistory.goBack();
          });
        }
        $ionicLoading.hide();
      });
    };

    $scope.restoreMessage = function(message) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.restoreSelectedMessages([message]).then(function() {
        $ionicHistory.goBack();
      });
      $ionicLoading.hide();
    };

    $scope.editMail = function(action) {
      $scope.closePopover();
      $scope.mail.action = action;
      $rootScope.historyMail = $scope.mail;
      $state.go("app.new_message");
    };

    $scope.$on("$ionicView.beforeEnter", function() {
      $ionicPopover
        .fromTemplateUrl("messagerie/popover_messagerie_detail.html", {
          scope: $scope
        })
        .then(function(popover) {
          $rootScope.popover = popover;
        });
    });

    $ionicPopover
      .fromTemplateUrl("messagerie/popover_messagerie_detail.html", {
        scope: $scope
      })
      .then(function(popover) {
        $rootScope.popover = popover;
      });

    function goToNewMail() {
      $rootScope.historyMail = $scope.mail;
      console.log($scope.mail);

      console.log($rootScope.historyMail);
      $state.go("app.new_message");
    }

    $scope.downloadAttachment = function(id) {
      var attachmentUrl =
        domainENT +
        "/conversation/message/" +
        $scope.mail.id +
        "/attachment/" +
        id;
      var attachment = findElementById($scope.mail.attachments, id);
      $rootScope.downloadFile(attachment.filename, attachmentUrl);
    };

    function getMessage() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.getMessage($state.params.idMessage).then(
        function(res) {
          $scope.mail = res.data;
          $scope.mail.from = getArrayNames([res.data.from], res.data);
          $scope.mail.to = getArrayNames(res.data.to, res.data);
          $scope.mail.cc = getArrayNames(res.data.cc, res.data);
          console.log($scope.mail);
          $ionicLoading.hide();
        },
        function() {
          $ionicLoading.hide();
        }
      );
    }

    function getArrayNames(ids, mail) {
      var names = [];

      for (var i = 0; i < ids.length; i++) {
        names.push({
          id: ids[i],
          displayName: $rootScope.getRealName(ids[i], mail.displayNames),
          entId: i
        });
      }
      return names;
    }
  });
