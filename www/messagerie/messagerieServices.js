angular
  .module("ent.message_services", ["ent.request"])

  .service("MessagerieServices", function(
    $q,
    domainENT,
    RequestService,
    $http,
    $rootScope
  ) {
    this.postAttachment = function(messageId, attachment) {
      return $http.post(
        domainENT + "/conversation/message/" + messageId + "/attachment",
        attachment,
        {
          transformRequest: angular.identity,
          headers: { "Content-Type": undefined }
        }
      );
    };

    this.getMessagesFolder = function(url) {
      return RequestService.get(url);
    };

    this.getCustomFolders = function() {
      return RequestService.get(domainENT + "/conversation/folders/list");
    };

    this.getExtraFolders = function(locationId) {
      var urlEnd = locationId == "TRASH" ? "trash" : "parentId=" + locationId;
      console.log(domainENT + "/conversation/folders/list?" + urlEnd);
      return RequestService.get(
        domainENT + "/conversation/folders/list?" + urlEnd
      );
    };

    this.getCountUnread = function(folders) {
      var promises = [];
      var deferredCombinedItems = $q.defer();
      var combinedItems = [];
      angular.forEach(folders, function(folderId, folderIndex) {
        var deferredItemList = $q.defer();
        var toRequest =
          domainENT + "/conversation/count/" + folderId + "?unread=";
        if (folderId == "DRAFT") toRequest += "false";
        else toRequest += "true";
        if (
          folderId != "INBOX" &&
          folderId != "OUTBOX" &&
          folderId != "DRAFT" &&
          folderId != "THRASH"
        )
          toRequest += "&restrain";
        RequestService.get(toRequest).then(function(resp) {
          combinedItems[folderIndex] = resp.data;
          deferredItemList.resolve();
        });
        promises.push(deferredItemList.promise);
      });

      $q.all(promises).then(function() {
        deferredCombinedItems.resolve(combinedItems);
      });
      return deferredCombinedItems.promise;
    };

    this.restoreSelectedMessages = function(arrayMessages) {
      var ids = [];

      angular.forEach(arrayMessages, function(item) {
        ids.push(item.id);
      });

      return RequestService.put(domainENT + "/conversation/restore", {
        id: ids
      });
    };

    this.deleteSelectedMessages = function(arrayMessages, nameFolder) {
      var ids = [];

      angular.forEach(arrayMessages, function(item) {
        ids.push(item.id);
      });

      return RequestService.put(
        domainENT +
          "/conversation/" +
          (nameFolder == "trash" ? "delete" : "trash"),
        { id: ids }
      );
    };

    this.getMessage = function(id) {
      return RequestService.get(domainENT + "/conversation/message/" + id);
    };

    this.moveMessages = function(messagesToMove, folderId) {
      var ids = [];
      angular.forEach(messagesToMove, function(message) {
        ids.push(message.id);
      });

      return RequestService.put(
        domainENT + "/conversation/move/userfolder/" + folderId,
        { id: ids }
      );
    };

    this.getContactsService = function(name) {
      if (name != null) {
        return RequestService.get(
          `${domainENT}/conversation/visible?search=${name}`
        );
      } else {
        return $q.reject("empty string");
      }
    };

    this.saveDraft = function(mail) {
      return RequestService.post(
        `${domainENT}/conversation/draft/${mail.id}`,
        getMailData(mail)
      );
    };

    this.saveDraftResponse = function(mail) {
      return RequestService.post(
        `${domainENT}/conversation/draft?In-Reply-To=${mail.replyTo}`,
        getMailData(mail)
      );
    };

    this.saveNewDraft = function(mail) {
      return RequestService.post(
        `${domainENT}/conversation/draft`,
        getMailData(mail)
      );
    };

    this.sendMail = function(mail) {
      return RequestService.post(
        `${domainENT}/conversation/send?id=${mail.id}`,
        getMailData(mail)
      );
    };

    this.sendReply = function(mail) {
      return RequestService.post(
        `${domainENT}/conversation/send?In-Reply-To=${mail.replyTo}`,
        getMailData(mail)
      );
    };

    this.getTranslation = function() {
      return RequestService.get(domainENT + "/conversation/i18n");
    };

    this.getNonPersonalFolders = function() {
      return [
        {
          id: "INBOX",
          name: "inbox"
        },
        {
          id: "OUTBOX",
          name: "outbox"
        },
        {
          id: "DRAFT",
          name: "draft"
        },
        {
          id: "TRASH",
          name: "trash"
        }
      ];
    };

    this.getPersonalFolderIds = function() {
      return ["INBOX", "OUTBOX", "DRAFT", "TRASH"];
    };

    this.getStatusRedactionMessage = function() {
      return ["DRAFT", "REPLY_ONE", "REPLY_ALL", "FORWARD"];
    };

    function getMailData(mail) {
      let newMail = {
        subject:
          mail.subject || $rootScope.translationConversation["nosubject"],
        body: "<p>" + mail.body.replace(/\n/g, "<br/>") + "</p>",
        to: mail.to.map(obj => obj.id),
        cc: mail.cc.map(obj => obj.id),
        from: $rootScope.myUser.id
      };
      if (mail.prevMessage) {
        newMail.body += mail.prevMessage;
      }
      newMail.body;
      if (mail.id) {
        newMail.id = mail.id;
      }

      return newMail;
    }
  })

  .factory("MoveMessagesPopupFactory", function(
    $ionicPopup,
    MessagerieServices,
    $rootScope
  ) {
    function getPopup(scope) {
      scope.choice = "";
      MessagerieServices.getCustomFolders().then(
        function(resp) {
          scope.folders = resp.data;
        },
        function(err) {
          alert("ERR:" + err);
        }
      );

      scope.selectFolder = function(message) {
        scope.choice = message.id;
        console.log("in select folder");
        console.log(scope.choice);
      };

      return $ionicPopup.show({
        templateUrl: "messagerie/popup_move_mail.html",
        title: $rootScope.translationConversation["mail.move"],
        subTitle: $rootScope.translationConversation["destination.folder"],
        scope: scope,
        buttons: [
          { text: $rootScope.translationConversation["cancel"] },
          {
            text: "<b>Ok</b>",
            type: "bar-positive",
            onTap: function(e) {
              if (!scope.choice) {
                e.preventDefault();
              } else {
                return scope.choice;
              }
            }
          }
        ]
      });
    }

    return {
      getPopup: getPopup
    };
  })

  .factory("DeleteMessagesPopupFactory", function($ionicPopup, $rootScope) {
    function getPopup() {
      return $ionicPopup.confirm({
        title: $rootScope.translationConversation["delete"],
        template: "Êtes-vous sûr(e) de vouloir supprimer ce(s) message(s) ?",
        cancelText: $rootScope.translationConversation["cancel"]
      });
    }

    return {
      getPopup: getPopup
    };
  })

  .factory("AlertMessagePopupFactory", function($ionicPopup) {
    function getPopup(titre, message) {
      return $ionicPopup.alert({
        title: titre,
        template: message
      });
    }

    return {
      getPopup: getPopup
    };
  });
