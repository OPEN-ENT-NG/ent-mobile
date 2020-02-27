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

        $scope.email = prefillNewMessage($stateParams.action)(
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

    function prefillNewMessage(action) {
      const defaultMessage = {
        to: [],
        cc: [],
        cci: [],
        subject: "",
        body: "",
        attachments: []
      };

      return prevMessage => {
        const getDisplayNamesForArray = usersId => usersId.map(getDisplayName);

        const getDisplayName = userId => {
          const foundUser = prevMessage.displayNames.find(
            displayName => displayName[0] == userId
          );
          const displayName = foundUser ? foundUser[1] : "Inconnu";
          return {
            displayName,
            id: userId
          };
        };

        const headerReponse = () => {
          const getUserArrayToString = users => {
            let result = "";
            for (const user of users) {
              result += getDisplayName(user).displayName + ", ";
            }
            return result.substring(0, result.length - 2);
          };

          var from = getDisplayName(prevMessage.from).displayName;
          var date = $filter("date")(prevMessage.date, "dd/MM/yyyy H:mm");
          var subject = prevMessage.subject;

          const to = getUserArrayToString(prevMessage.to);

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
            const cc = getUserArrayToString(prevMessage.cc);

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

        const distinct = (value, index, self) => self.indexOf(value) === index;

        const getAdapter = function(action) {
          switch (action) {
            case "REPLY_ONE": {
              return {
                ...defaultMessage,
                replyTo: prevMessage.id,
                to: getDisplayNamesForArray([prevMessage.from]),
                subject:
                  $rootScope.translationConversation["reply.re"] +
                  prevMessage.subject,
                prevMessage: headerReponse(prevMessage) + prevMessage.body
              };
            }
            case "REPLY_ALL": {
              return {
                ...defaultMessage,
                replyTo: prevMessage.id,
                to: getDisplayNamesForArray(
                  [
                    prevMessage.from,
                    ...prevMessage.to.filter(
                      user => user != $rootScope.myUser.userId
                    )
                  ].filter(distinct)
                ),
                cc: getDisplayNamesForArray(prevMessage.cc.filter(id => id !== prevMessage.from)),
                subject:
                  $rootScope.translationConversation["reply.re"] +
                  prevMessage.subject,
                prevMessage: headerReponse(prevMessage) + prevMessage.body
              };
            }
            case "FORWARD": {
              return {
                ...defaultMessage,
                replyTo: prevMessage.id,
                subject:
                  $rootScope.translationConversation["reply.fw"] +
                  prevMessage.subject,
                prevMessage: headerReponse(prevMessage) + prevMessage.body
              };
            }
            case "DRAFT": {
              return {
                ...defaultMessage,
                ...prevMessage,
                to: getDisplayNamesForArray(prevMessage.to),
                cc: getDisplayNamesForArray(prevMessage.cc),
                cci: getDisplayNamesForArray(prevMessage.cci),
                body: deleteHtmlContent(prevMessage.body)
              };
            }
          }
        };

        if (action) {
          return getAdapter(action);
        } else {
          return defaultMessage;
        }
      };
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
