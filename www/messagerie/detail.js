angular
  .module("ent.message_detail", ["ent.message_services", "ent.messagerie"])

  .controller("MessagesDetailCtrl", function(
    $scope,
    $rootScope,
    $ionicPopover,
    $state,
    $stateParams,
    domainENT,
    MessagerieServices,
    $ionicLoading,
    $ionicHistory,
    MoveMessagesPopupFactory,
    PopupFactory
  ) {
    getMessage($stateParams.idMessage);

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
      return "draft" === $stateParams.nameFolder;
    };

    $scope.isInbox = function() {
      return (
        ["outbox", "draft", "trash"].indexOf($stateParams.nameFolder) === -1
      );
    };

    $scope.isTrash = function() {
      return "trash" === $stateParams.nameFolder;
    };

    $scope.trash = function() {
      PopupFactory.getConfirmPopup(
        $rootScope.translationConversation["delete"],
        "Êtes-vous sûr(e) de vouloir supprimer ce(s) message(s) ?"
      ).then(function(res) {
        if (res) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });
          MessagerieServices.deleteSelectedMessages(
            [$scope.mail],
            $stateParams.nameFolder
          ).then(
            function() {
              $ionicLoading.hide();
              PopupFactory.getAlertPopup(
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
      $state.go("app.new_message", { prevMessage: $scope.mail, action });
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

    $scope.downloadAttachment = function(id) {
      var attachmentUrl =
        domainENT +
        "/conversation/message/" +
        $scope.mail.id +
        "/attachment/" +
        id;
      var attachment = $scope.mail.attachments.find(att => att.id == id);
      $rootScope.downloadFile(attachment.filename, attachmentUrl);
    };

    function getMessage(idMessage) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.getMessage(idMessage).then(
        function(res) {
          $scope.mail = res.data;
          $scope.mail.from = getArrayNames([res.data.from], res.data);
          $scope.mail.to = getArrayNames(res.data.to, res.data);
          $scope.mail.cc = getArrayNames(res.data.cc, res.data);
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
