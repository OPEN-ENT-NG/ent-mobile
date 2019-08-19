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
        saveDraft($scope.email).then(({ data }) => ($scope.email.id = data.id));
      }
    });

    $scope.goToMessagerie = function() {
      $scope.closePopover();
      $state.go("app.messagerie");
    };

    $ionicPopover
      .fromTemplateUrl("messagerie/popover_messagerie_new.html", {
        scope: $scope
      })
      .then(function(popover) {
        $rootScope.popover = popover;
      });

    $scope.deleteFromDestinataireTo = function(destinataire) {
      var index = $scope.email.to.indexOf(destinataire);
      $scope.email.to.splice(index, 1);
    };

    $scope.deleteFromDestinataireCc = function(destinataire) {
      var index = $scope.email.cc.indexOf(destinataire);
      $scope.email.cc.splice(index, 1);
    };

    $scope.deleteFromDestinataireCci = function(destinataire) {
      var index = $scope.email.cci.indexOf(destinataire);
      $scope.email.cci.splice(index, 1);
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
      MessagerieServices.saveDraft(mail).then(function(resp) {
        $scope.closePopover();
        PopupFactory.getAlertPopup(
          $rootScope.translationConversation["save"],
          $rootScope.translationConversation["draft.saved"]
        )
          .then(function() {
            $ionicHistory.clearCache();
            $ionicHistory.goBack();
          })
          .catch(() => {
            PopupFactory.getAlertPopup(
              $rootScope.translationConversation["save"],
              $rootScope.translationConversation["message.save.fail"]
            );
          });
      });
    };

    $scope.addAttachment = function(ele) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      var attachment = ele.files[0];
      console.log(attachment);

      var formData = new FormData();
      formData.append("file", attachment);

      MessagerieServices.postAttachment($scope.email.id, formData).then(
        function(result) {
          console.log(result);
          $ionicLoading.hide();
          $scope.email.attachments.push({
            contentType: attachment.type,
            filename: attachment.name,
            size: attachment.size,
            id: result.data.id,
            name: "file"
          });
          $scope.$apply();
        },
        function() {
          $ionicLoading.hide();
        }
      );
    };

    $scope.deleteAttachment = function(index) {
      $scope.email.attachments.splice(index, 1);
      $scope.$apply();
    };

    $scope.downloadAttachment = function(id) {
      var attachmentUrl =
        domainENT +
        "/conversation/message/" +
        $scope.email.id +
        "/attachment/" +
        id;
      var attachment = $scope.mail.attachments.find(att => att.id == id);
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

      const deleteMyself = function(prevMessage) {
        const filter = array =>
          array.filter(user => $rootScope.myUser.userId != user.id);

        return {
          ...prevMessage,
          to: filter(prevMessage.to),
          cc: filter(prevMessage.cc),
          cci: filter(prevMessage.cci)
        };
      };

      const deleteHtmlContent = function(text) {
        const regexp = /<([a-z]+)[^>]*>(.*?)<\/\1>/g;

        if (regexp.test(text)) {
          return deleteHtmlContent(text.replace(regexp, "$2"));
        } else {
          return text;
        }
      };

      const replyToOneAdapter = function(prevMessage) {
        return {
          ...defaultMessage,
          replyTo: prevMessage.id,
          to: prevMessage.from,
          subject:
            $rootScope.translationConversation["reply.re"] +
            prevMessage.subject,
          prevMessage: headerReponse(prevMessage) + prevMessage.body
        };
      };

      const replyToAllAdapter = function(prevMessage) {
        return {
          ...defaultMessage,
          replyTo: prevMessage.id,
          to: prevMessage.from.concat(prevMessage.to),
          subject:
            $rootScope.translationConversation["reply.re"] +
            prevMessage.subject,
          prevMessage: headerReponse(prevMessage) + prevMessage.body
        };
      };

      const forwardAdapter = function(prevMessage) {
        return {
          ...defaultMessage,
          replyTo: prevMessage.id,
          subject:
            $rootScope.translationConversation["reply.fw"] +
            prevMessage.subject,
          prevMessage: headerReponse(prevMessage) + prevMessage.body
        };
      };

      const draftAdapter = function(prevMessage) {
        return {
          ...defaultMessage,
          ...prevMessage,
          body: prevMessage.body.toString().replace(/\<br\/\>/g, "\n")
        };
      };

      const findAdapter = function(action) {
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
          default: {
            return () => defaultMessage;
          }
        }
      };

      return findAdapter(action)({
        ...deleteMyself(prevMessage),
        body: deleteHtmlContent(prevMessage.body)
      });
    }

    function headerReponse(prevMessage) {
      var from = prevMessage.from[0].displayName;
      var date = $filter("date")(prevMessage.date, "dd/MM/yyyy H:mm");
      var subject = prevMessage.subject;

      var to = "";
      for (var i = 0; i < prevMessage.to.length; i++) {
        to += prevMessage.to[i].displayName + " ";
      }

      if (prevMessage.cc.length > 0) {
        var cc = "";
        for (var i = 0; i < prevMessage.cc.length; i++) {
          cc += prevMessage.cc[i].displayName + " ";
        }
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
        header +=
          "<br>" +
          '<span class="medium-importance" translate="" key="transfer.cc"><span class="no-style ng-scope">Copie à : </span></span>' +
          '<em class="medium-importance ng-scope">' +
          cc +
          "</em>";
      }

      header +=
        '</p><blockquote class="ng-scope">' +
        '<p class="ng-scope" style="font-size: 24px; line-height: 24px;">';

      return header;
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

        function verifiedEmailDestinataire(destToCheck) {
          for (let destinataire of scope.destinataires) {
            if (destinataire.id == destToCheck.id) {
              return false;
            }
          }
          return true;
        }

        function pushContact(isUser, contact, contacts) {
          if (verifiedEmailDestinataire(contact)) {
            contacts.push({
              id: contact.id,
              displayName: isUser ? contact.displayName : contact.name
            });
          }
        }

        scope.$watch("search", function(newValue, oldValue) {
          if (
            newValue.length > oldValue.length &&
            newValue.length == attrs.minLength
          ) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"/>'
            });
            MessagerieServices.getContactsService(newValue).then(function(
              resp
            ) {
              for (let contact of resp.data.groups) {
                pushContact(false, contact, scope.contacts);
              }
              for (let contact of resp.data.users) {
                pushContact(true, contact, scope.contacts);
              }
              $ionicLoading.hide();
            },
            $ionicLoading.hide);
          } else {
            scope.contacts = [];
          }
        });
      },
      templateUrl: "messagerie/filterBoxTemplate.html"
    };
  });
