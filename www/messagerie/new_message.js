angular
  .module("ent.new_message", ["ent.message_services"])

  .controller("NewMessageCtrl", function(
    $scope,
    $rootScope,
    $ionicPopover,
    $state,
    $stateParams,
    $ionicHistory,
    MessagerieServices,
    $ionicLoading,
    PopupFactory,
    domainENT,
    $filter,
    $ionicPlatform
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.beforeEnter", function() {
        $ionicPopover
          .fromTemplateUrl("messagerie/popover_messagerie_new.html", {
            scope: $scope
          })
          .then(function(popover) {
            $scope.popover = popover;
          });

        $scope.email = prefillNewMessage(
          $stateParams.action,
          $stateParams.prevMessage
        );

        let saveDraft = null;
        if ($stateParams.action == null) {
          saveDraft = MessagerieServices.saveNewDraft;
        } else if ($stateParams.action != "DRAFT") {
          saveDraft = MessagerieServices.saveNewDraftResponse;
        }

        if (saveDraft) {
          saveDraft($scope.email).then(
            ({ data }) => ($scope.email.id = data.id)
          );
        }
      });
    });

    $scope.deleteDraft = function(mail) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.deleteSelectedMessages([mail], "DRAFT")
        .then(() => {
          $scope.popover.hide();
          PopupFactory.getAlertPopup(
            $rootScope.translationConversation["delete"],
            "Brouillon supprimer avec succès."
          ).then(function() {
            $ionicHistory.clearCache();
            $state.go("app.messagerie");
          });
        })
        .catch(() => {
          PopupFactory.getAlertPopup(
            $rootScope.translationConversation["delete"],
            "Echec de la suppression du brouillon."
          );
        })
        .finally($ionicLoading.hide);
    };

    $scope.deleteUser = function(destinataire, collection) {
      var index = collection.indexOf(destinataire);
      collection.splice(index, 1);
    };

    $scope.sendMail = function(mail) {
      if (mail.to.length > 0) {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        let promise = mail.replyTo
          ? MessagerieServices.sendReply
          : MessagerieServices.sendMail;

        promise(mail).then(function(resp) {
          $ionicLoading.hide();
          $state.go("app.messagerie");
        });
      } else {
        PopupFactory.getAlertPopupNoTitle("Impossible d'envoyer le message");
      }
    };

    $scope.saveAsDraft = function(mail) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.saveDraft(mail)
        .then(() => {
          $scope.popover.hide();
          PopupFactory.getAlertPopup(
            $rootScope.translationConversation["save"],
            $rootScope.translationConversation["draft.saved"]
          ).then(function() {
            $ionicHistory.clearCache();
            $ionicHistory.goBack();
          });
        })
        .catch(() => {
          PopupFactory.getAlertPopup(
            $rootScope.translationConversation["save"],
            $rootScope.translationConversation["message.save.fail"]
          );
        })
        .finally($ionicLoading.hide);
    };

    $scope.addAttachment = function(ele) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      var attachment = ele.files[0];

      var formData = new FormData();
      formData.append("file", attachment);

      MessagerieServices.postAttachment($scope.email.id, formData)
        .then(result => {
          $scope.email.attachments.push({
            filename: attachment.name,
            size: attachment.size,
            id: result.data.id
          });
        })
        .catch(() =>
          PopupFactory.getAlertPopupNoTitle(
            "Echec dans l'ajout de la piece jointe"
          )
        )
        .finally($ionicLoading.hide);
    };

    $scope.deleteAttachment = function(attachmentId) {
      MessagerieServices.deleteAttachment($scope.email.id, attachmentId)
        .then(() => {
          const attachmentIndex = $scope.email.attachments.findIndex(
            attachment => attachment.id == attachmentId
          );
          if (Number.isInteger(attachmentIndex))
            $scope.email.attachments.splice(attachmentIndex, 1);
        })
        .catch(() =>
          PopupFactory.getAlertPopupNoTitle(
            "Echec dans la suppression de la piece jointe"
          )
        )
        .finally($ionicLoading.hide);
    };

    $scope.downloadAttachment = function(id) {
      var attachmentUrl =
        domainENT +
        "/conversation/message/" +
        $scope.email.id +
        "/attachment/" +
        id;
      var attachment = $scope.email.attachments.find(att => att.id == id);
      $rootScope.downloadFile(attachment.filename, attachmentUrl);
    };

    function prefillNewMessage(action, prevMessage) {
      const defaultMessage = {
        to: [],
        cc: [],
        cci: [],
        subject: "",
        body: "",
        attachments: []
      };

      const getDisplayNames = message => {
        const getDisplayNamesForArray = users =>
          users.map(id => {
            const foundUser = prevMessage.displayNames.find(
              displayName => displayName[0] == id
            );
            const displayName = foundUser ? foundUser[1] : "Inconnu";
            return {
              displayName,
              id
            };
          });

        return {
          ...message,
          to: getDisplayNamesForArray(message.to || []),
          cc: getDisplayNamesForArray(message.cc || []),
          cci: getDisplayNamesForArray(message.cci || [])
        };
      };

      const findAdapter = function(action) {
        const removeMyself = message => {
          const filter = array =>
            array.filter(user => $rootScope.myUser.userId != user.id);

          return {
            ...message,
            to: filter(message.to || []),
            cc: filter(message.cc || []),
            cci: filter(message.cci || [])
          };
        };

        const headerReponse = () => {
          var from = prevMessage.displayNames.find(user => user[0] == prevMessage.from)[1];
          var date = $filter("date")(prevMessage.date, "dd/MM/yyyy H:mm");
          var subject = prevMessage.subject;

          var to = "";
          for (let userTo of prevMessage.to) {
            to += prevMessage.displayNames.find(user => user[0] == userTo)[1] + ", ";
          }
          to = to.substring(0, to.length - 2);

          if (prevMessage.cc.length > 0) {
            var cc = "";
            for (let userCc of prevMessage.cc) {
              cc += prevMessage.displayNames.find(user => user[0] == userCc)[1] + ", ";
            }
            cc = cc.substring(0, cc.length - 2);
          }

          var header =
            '<p class="row ng-scope"></p>' +
            '<hr class="ng-scope">' +
            '<p class="ng-scope"></p>' +
            '<p class="medium-text ng-scope">' +
            '<span translate="" key="transfer.from"><span class="no-style ng-scope">De : </span></span>' +
            '<em class="ng-binding">' +
            from +
            "</em>" +
            "<br>" +
            '<span class="medium-importance" translate="" key="transfer.date"><span class="no-style ng-scope">Date: </span></span>' +
            '<em class="ng-binding">' +
            date +
            "</em>" +
            "<br>" +
            '<span class="medium-importance" translate="" key="transfer.subject"><span class="no-style ng-scope">Objet : </span></span>' +
            '<em class="ng-binding">' +
            subject +
            "</em>" +
            "<br>" +
            '<span class="medium-importance" translate="" key="transfer.to"><span class="no-style ng-scope">A : </span></span>' +
            '<em class="medium-importance">' +
            to +
            "</em>";

          if (prevMessage.cc.length > 0) {
            header += `<br><span class="medium-importance" translate="" key="transfer.cc">
            <span class="no-style ng-scope">Copie à : </span>
            </span><em class="medium-importance ng-scope">${cc}</em>`;
          }

          header +=
            '</p><blockquote class="ng-scope">' +
            '<p class="ng-scope" style="font-size: 24px; line-height: 24px;">';

          return header;
        };

        const deleteHtmlContent = function(text) {
          const regexp = /<(\S+)[^>]*>(.*)<\/\1>/gs;

          if (regexp.test(text)) {
            return deleteHtmlContent(text.replace(regexp, "$2"));
          } else {
            return text.replace(/\<br\/\>/g, "\n").replace(/&nbsp/g, "");
          }
        };

        const replyToOneAdapter = removeMyself({
          ...defaultMessage,
          replyTo: prevMessage.id,
          to: [prevMessage.from],
          subject:
            $rootScope.translationConversation["reply.re"] +
            prevMessage.subject,
          prevMessage:
            headerReponse(getDisplayNames(prevMessage)) + prevMessage.body
        });

        const replyToAllAdapter = removeMyself({
          ...replyToOneAdapter,
          to: prevMessage.to
            .concat(prevMessage.from)
            .concat(prevMessage.cc)
        });

        const forwardAdapter = removeMyself({
          ...defaultMessage,
          replyTo: prevMessage.id,
          subject:
            $rootScope.translationConversation["reply.fw"] +
            prevMessage.subject,
          prevMessage:
            headerReponse(getDisplayNames(prevMessage)) + prevMessage.body
        });

        const draftAdapter = {
          ...defaultMessage,
          ...prevMessage,
          body: deleteHtmlContent(prevMessage.body)
        };

        switch (action) {
          case "REPLY_ONE": {
            return replyToOneAdapter;
          }
          case "REPLY_ALL": {
            return replyToAllAdapter;
          }
          case "FORWARD": {
            return forwardAdapter;
          }
          case "DRAFT": {
            return draftAdapter;
          }
        }
      };

      if (action) {
        return getDisplayNames(findAdapter(action));
      } else {
        return defaultMessage;
      }
    }
  })

  .directive("textarea", function() {
    return {
      restrict: "E",
      link: function(scope, element, attr) {
        var update = function() {
          element.css("height", "auto");
          element.css("height", element[0].scrollHeight + "px");
        };
        scope.$watch(attr.ngModel, function() {
          update();
        });
      }
    };
  })

  .directive("filterBox", function($ionicLoading, MessagerieServices) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        placeholder: "@",
        destinataires: "="
      },
      link: function(scope, element, attrs) {
        attrs.minLength = attrs.minLength || 3;
        scope.placeholder = attrs.placeholder || "";
        scope.search = "";

        scope.addContact = function(contact) {
          scope.destinataires.push(contact);
          scope.search = "";
        };

        function pushContact(isUser, contact) {
          const verifiedEmailDestinataire = destToCheck => {
            for (let destinataire of scope.destinataires) {
              if (destinataire.id == destToCheck.id) {
                return false;
              }
            }
            return true;
          };
          if (verifiedEmailDestinataire(contact)) {
            scope.contacts.push({
              id: contact.id,
              displayName: isUser ? contact.displayName : contact.name
            });
          }
        }

        scope.$watch("search", function(newValue, oldValue) {
          scope.contacts = [];
          if (
            newValue.length > oldValue.length &&
            newValue.length >= attrs.minLength
          ) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"/>'
            });
            MessagerieServices.getContactsService(newValue)
              .then(function(resp) {
                for (let contact of resp.data.groups) {
                  pushContact(false, contact);
                }
                for (let contact of resp.data.users) {
                  pushContact(true, contact);
                }
              })
              .finally($ionicLoading.hide);
          }
        });
      },
      templateUrl: "messagerie/filterBoxTemplate.html"
    };
  });
