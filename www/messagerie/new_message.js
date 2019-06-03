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
    AlertMessagePopupFactory,
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
        saveDraft = MessagerieServices.saveDraftResponse;
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
        AlertMessagePopupFactory.getPopup(
          $rootScope.translationConversation["save"],
          $rootScope.translationConversation["draft.saved"]
        ).then(function() {
          $ionicHistory.clearCache();
          $ionicHistory.goBack();
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

    $scope.expandText = function() {
      var element = document.getElementById("textMessage");
      element.style.height = element.scrollHeight + "px";
    };

    function prefillNewMessage(action, prevMessage) {
      let returnMessage = {
        to: [],
        cc: [],
        subject: "",
        body: "",
        attachments: []
      };

      if (prevMessage) {
        prevMessage.to = prevMessage.to.filter(
          to => $rootScope.myUser.id != to.id
        );
        prevMessage.cc = prevMessage.cc.filter(
          cc => $rootScope.myUser.id != cc.id
        );
      }

      switch (action) {
        case "REPLY_ONE": {
          returnMessage.replyTo = prevMessage.id;
          returnMessage.to = prevMessage.from;
          returnMessage.subject =
            $rootScope.translationConversation["reply.re"] +
            prevMessage.subject;
          returnMessage.prevMessage =
            headerReponse(prevMessage) + prevMessage.body;
          break;
        }

        case "REPLY_ALL": {
          returnMessage.replyTo = prevMessage.id;
          returnMessage.to = prevMessage.from.concat(prevMessage.to);
          returnMessage.cc = prevMessage.cc;
          returnMessage.subject =
            $rootScope.translationConversation["reply.re"] +
            prevMessage.subject;
          returnMessage.prevMessage =
            headerReponse(prevMessage) + prevMessage.body;
          break;
        }

        case "FORWARD": {
          returnMessage.replyTo = prevMessage.id;
          returnMessage.subject =
            $rootScope.translationConversation["reply.fw"] +
            prevMessage.subject;
          returnMessage.prevMessage =
            headerReponse(prevMessage) + prevMessage.body;
          returnMessage.attachments = prevMessage.attachments;
          break;
        }

        case "DRAFT": {
          returnMessage.id = prevMessage.id;
          returnMessage.to = prevMessage.to;
          returnMessage.cc = prevMessage.cc;
          returnMessage.subject = prevMessage.subject;
          returnMessage.body = prevMessage.body
            .toString()
            .replace(/\<br\/\>/g, "\n");
          returnMessage.attachments = prevMessage.attachments;
          break;
        }
      }

      return returnMessage;
    }

    function headerReponse(prevMessage) {
      var from = prevMessage.from[0].displayName;
      var date = $filter("date")(prevMessage.date, "dd/MM/yyyy H:mm");
      var subject = prevMessage.subject;

      var to = "";
      for (var i = 0; i < prevMessage.to.length; i++) {
        to += prevMessage.to[i].displayName + " ";
      }

      var cc = "";
      for (var i = 0; i < prevMessage.cc.length; i++) {
        cc += prevMessage.cc[i].displayName + " ";
      }

      var header =
        '<p class="row ng-scope"></p>' +
        '<hr class="ng-scope">' +
        '<p class="ng-scope"></p>' +
        '<p class="medium-text ng-scope">' +
        '<span translate="" key="transfer.from"><span class="no-style ng-scope">De : </span></span><em class="ng-binding">' +
        from +
        "</em>" +
        "<br>" +
        '<span class="medium-importance" translate="" key="transfer.date"><span class="no-style ng-scope">Date: </span></span><em' +
        'class="ng-binding">' +
        date +
        "</em> <br>" +
        '<span class="medium-importance" translate="" key="transfer.subject"><span class="no-style ng-scope">Objet : </span></span><em' +
        'class="ng-binding">' +
        subject +
        "</em>" +
        "<br>" +
        '<span class="medium-importance" translate="" key="transfer.to"><span class="no-style ng-scope">A : </span></span>' +
        '<em class="medium-importance">' +
        to +
        "</em>" +
        "<br>" +
        '<span class="medium-importance" translate="" key="transfer.cc"><span class="no-style ng-scope">Copie à : </span></span>' +
        '<em class="medium-importance ng-scope">' +
        cc +
        '</p><blockquote class="ng-scope">' +
        '<p class="ng-scope" style="font-size: 24px; line-height: 24px;">';

      return header;
    }
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
