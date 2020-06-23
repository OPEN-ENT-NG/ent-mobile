angular
  .module("ent.message_services", ["ent.request"])

  .service("MessagerieServices", function (
    $q,
    domainENT,
    RequestService,
    $rootScope,
    FileService
  ) {
    this.mailAdapter = function (mail) {
      return {
        id: mail.id,
        state: mail.state,
        unread: mail.unread,
        attachments: mail.attachments || [],
        subject: mail.subject || "",
        hasAttachment: mail.hasAttachment || false,
        from: mail.from,
        to: mail.to || [],
        cc: mail.cc || [],
        cci: mail.cci || [],
        date: mail.date,
        body: mail.body || "",
        displayNames: mail.displayNames || [],
      };
    };

    this.postAttachment = function (messageId, attachment) {
      return FileService.uploadFile(
        `${domainENT}/conversation/message/${messageId}/attachment`,
        null,
        attachment
      );
    };

    this.deleteAttachment = function (messageId, attachmentId) {
      return RequestService.delete(
        `${domainENT}/conversation/message/${messageId}/attachment/${attachmentId}`
      );
    };

    this.getMessages = function (idFolder, page) {
      const restrain = !this.getNonPersonalFolders()
        .map((folder) => folder.id)
        .includes(idFolder);
      const params = { page: page.toString(), unread: "false" };
      if (restrain) params["restrain"] = "";
      return RequestService.get(
        `${domainENT}/conversation/list/${idFolder}`,
        params
      );
    };

    this.getFolders = function (parentId) {
      const params = parentId ? { parentId } : {};
      return RequestService.get(
        `${domainENT}/conversation/folders/list`,
        params
      );
    };

    this.getCount = function (folderId, status) {
      const params = { unread: status.toString() };
      const restrain = !this.getNonPersonalFolders()
        .map((folder) => folder.id)
        .includes(folderId);
      if (restrain) params["restrain"] = "";
      return RequestService.get(
        `${domainENT}/conversation/count/${folderId}`,
        params
      );
    };

    this.restoreSelectedMessages = function (arrayMessages) {
      const id = arrayMessages.map((item) => item.id);
      const data = { id };
      return RequestService.put(
        domainENT + "/conversation/restore",
        null,
        data
      );
    };

    this.deleteSelectedMessages = function (arrayMessages, nameFolder) {
      const id = arrayMessages.map((item) => item.id);
      const data = { id };
      const url =
        nameFolder == "trash"
          ? `${domainENT}/conversation/delete`
          : `${domainENT}/conversation/trash`;
      return RequestService.put(url, null, data);
    };

    this.getMessage = function (id) {
      return RequestService.get(domainENT + "/conversation/message/" + id);
    };

    this.moveMessages = function (arrayMessages, folderId) {
      const id = arrayMessages.map((item) => item.id);
      const data = { id };
      return RequestService.put(
        domainENT + "/conversation/move/userfolder/" + folderId,
        null,
        data
      );
    };

    this.getContactsService = function (name) {
      if (name != null) {
        return RequestService.get(`${domainENT}/conversation/visible`, {
          search: name,
        });
      } else {
        return $q.reject("empty string");
      }
    };

    this.saveDraft = function (mail) {
      return RequestService.put(
        `${domainENT}/conversation/draft/${mail.id}`,
        null,
        getMailData(mail)
      );
    };

    this.saveNewDraftResponse = function (mail) {
      return RequestService.post(
        `${domainENT}/conversation/draft`,
        { "In-Reply-To": mail.replyTo },
        getMailData(mail)
      );
    };

    this.saveNewDraft = function (mail) {
      return RequestService.post(
        `${domainENT}/conversation/draft`,
        null,
        getMailData(mail)
      );
    };

    this.sendMail = function (mail) {
      return RequestService.post(
        `${domainENT}/conversation/send`,
        { id: mail.id },
        getMailData(mail)
      );
    };

    this.sendReply = function (mail) {
      return RequestService.post(
        `${domainENT}/conversation/send`,
        { "In-Reply-To": mail.replyTo },
        getMailData(mail)
      );
    };

    this.getTranslation = function () {
      return RequestService.get(domainENT + "/conversation/i18n");
    };

    this.getNonPersonalFolders = function () {
      return [
        {
          id: "INBOX",
          name: "inbox",
        },
        {
          id: "OUTBOX",
          name: "outbox",
        },
        {
          id: "DRAFT",
          name: "draft",
        },
        {
          id: "TRASH",
          name: "trash",
        },
      ];
    };

    function getMailData(mail) {
      const newMail = {
        subject:
          mail.subject || $rootScope.translationConversation["nosubject"],
        body: mail.body.replace(/\n/g, "<br/>"),
        to: mail.to.map((obj) => obj.id),
        cc: mail.cc.map((obj) => obj.id),
        cci: mail.cci.map((obj) => obj.id),
      };

      if (mail.prevMessage) {
        newMail.body += mail.prevMessage;
      }

      return newMail;
    }
  })

  .factory("MoveMessagesPopupFactory", function (
    $ionicPopup,
    MessagerieServices,
    $rootScope,
    PopupFactory,
    $ionicLoading
  ) {
    function handleSubFolders(subfolders) {
      if (subfolders.length == 0) {
        return [];
      } else {
        return $q
          .all(subfolders.map((folder) => getFolders(folder.id)))
          .then((arrayResp) => {
            let result = [];
            for (let i = 0; i < subfolders.length; i++) {
              result = spreadObject(result, [subfolders[i]], arrayResp[i]);
            }
            return result;
          });
      }
    }

    function getFolders(idParent) {
      return MessagerieServices.getFolders(idParent).then(({ data }) =>
        handleSubFolders(data)
      );
    }

    function getPopup(scope) {
      scope.choice = "";
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      getFolders()
        .then((resp) => (scope.folders = resp))
        .catch(PopupFactory.getCommonAlertPopup)
        .finally($ionicLoading.hide);

      scope.selectFolder = function (message) {
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
            onTap: function (e) {
              if (!scope.choice) {
                e.preventDefault();
              } else {
                return scope.choice;
              }
            },
          },
        ],
      });
    }

    return {
      getPopup: getPopup,
    };
  });
