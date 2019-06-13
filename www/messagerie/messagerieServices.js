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

    this.getMessages = function(idFolder, page) {
      return RequestService.get(
        `${domainENT}/conversation/list/${idFolder}?page=${page}`
      );
    };

    this.getFolders = function(parentId) {
      let parent = parentId ? `?parentId=${parentId}` : "";
      return RequestService.get(
        `${domainENT}/conversation/folders/list${parent}`
      );
    };

    this.getCount = function(folderId, status) {
      return RequestService.get(
        `${domainENT}/conversation/count/${folderId}?unread=${status}`
      );
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

    function getMailData(mail) {
      let newMail = {
        subject:
          mail.subject || $rootScope.translationConversation["nosubject"],
        body: "<p>" + mail.body.replace(/\n/g, "<br/>") + "</p>",
        to: mail.to.map(obj => obj.id),
        cc: mail.cc.map(obj => obj.id),
        cci: mail.cci.map(obj => obj.id),
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
      MessagerieServices.getFolders().then(
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
  });
