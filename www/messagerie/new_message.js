angular.module('ent.new_message', ['ent.message_services', 'monospaced.elastic'])

.controller('NewMessageCtrl', function($scope, $rootScope, $ionicPopover, $state, $ionicHistory, MessagerieServices,$ionicLoading,$ionicPopup, $filter, domainENT){

  $scope.email = {
    destinatairesTo: [],
    destinatairesCc: [],
    sujet: '',
    corps : '',
    newMessage: '',
    attachments: [],
    id: 0
  };
  console.log("$rootScope.historyMail");
  console.log($rootScope.historyMail);

  switch($rootScope.historyMail.action){
    case "REPLY_ONE":
      console.log("switch reply one");
      $scope.email.destinatairesTo = $rootScope.historyMail.from;
      $scope.email.destinatairesCc = [];
      $scope.email.sujet = $rootScope.translationConversation["reply.re"]+$rootScope.historyMail.subject;
      $scope.email.corps= headerReponse()+$rootScope.historyMail.body;
      $scope.email.id = $rootScope.historyMail.id;
      $scope.email.attachments = [];
      break;

      case "REPLY_ALL":
        console.log("switch reply_all");
        $scope.email.destinatairesTo = $rootScope.historyMail.from.concat($rootScope.historyMail.to);
        $scope.email.destinatairesCc = $rootScope.historyMail.cc;
        $scope.email.sujet = $rootScope.translationConversation["reply.re"]+$rootScope.historyMail.subject;
        $scope.email.corps= headerReponse()+$rootScope.historyMail.body;
        $scope.email.id = $rootScope.historyMail.id;
        $scope.email.attachments = [];
        break;

        case "FORWARD":
          console.log("switch forward");
          $scope.email.destinatairesTo = [];
          $scope.email.destinatairesCc = [];
          $scope.email.sujet = $rootScope.translationConversation["reply.fw"]+$rootScope.historyMail.subject;
          $scope.email.corps= headerReponse()+$rootScope.historyMail.body;
          $scope.email.id = $rootScope.historyMail.id;
          $scope.email.attachments = $rootScope.historyMail.attachments;
          break;

          case "DRAFT":
            console.log("switch draft");
            $scope.email.destinatairesTo = $rootScope.historyMail.to;
            $scope.email.destinatairesCc = $rootScope.historyMail.cc;
            $scope.email.sujet = $rootScope.historyMail.subject;
            $scope.email.newMessage= $rootScope.historyMail.body.replace(/\<br\/\>/g, "\n");
            $scope.email.id = $rootScope.historyMail.id;
            $scope.email.attachments = [];
            break;

            //draft
            default:
              console.log("new message");
              saveNewDraft();
              break;
            }
            removeMyself();
            console.log($scope.email);

            $scope.addContactTo = function(search, contact){
              $scope.email.destinatairesTo.push(contact);
              search.value ="";
            }

            $scope.addContactCc = function(search, contact){
              $scope.email.destinatairesCc.push(contact);
              search.value ="";
            }

            $scope.deleteFromDestinataireTo = function(destinataire){
              var index = $scope.email.destinatairesTo.indexOf(destinataire);
              $scope.email.destinatairesTo.splice(index, 1);
            }

            $scope.deleteFromDestinataireCc = function(destinataire){
              var index = $scope.email.deleteFromDestinataireCc.indexOf(destinataire);
              $scope.email.destinatairesCc.splice(index, 1);
            }

            $scope.sendMail = function(){

              if($scope.email.destinatairesTo.length >0){
                $ionicLoading.show({
                  template: '<i class="spinnericon- taille"></i>'
                });
                MessagerieServices.sendMail(getMailData()).then(function(resp){
                  console.log("Success");
                  $ionicLoading.hide();
                  $state.go("app.messagerie");
                }, function(err){
                  console.log(err);
                  $scope.showAlertError();
                });
              } else {
                var alertPopup = $ionicPopup.alert({
                  template: 'Impossible d\'envoyer le message',
                  title: 'Aucun destinataire !'
                });

                alertPopup.then(function(res) {
                  console.log('pas de destinataire');
                });
              }
            }

            $scope.saveAsDraft = function(){
              saveWithId($scope.email.id)
            }
            $scope.addAttachment = function(ele){
              $ionicLoading.show({
                template: '<i class="spinnericon- taille"></i>'
              });
              var attachment = ele.files[0];
              console.log(attachment);

              var formData = new FormData()
              formData.append('file', attachment)

              MessagerieServices.postAttachment($scope.email.id, formData).then(function(result){
                console.log(result);
                $ionicLoading.hide();
                $scope.email.attachments.push({
                  contentType: attachment.type,
                  filename: attachment.name,
                  size: attachment.size,
                  id: result.data.id,
                  name: "file"
                })
                $scope.$apply()
              }, function(e){
                $ionicLoading.hide();
                $scope.showAlertError(e);
              });
            }

            $scope.deleteAttachment = function(index){
              $scope.email.attachments.splice(index, 1);
              $scope.$apply();
            }

            $scope.downloadAttachment = function (id){
              var attachmentUrl = domainENT+"/conversation/message/"+$scope.email.id+"/attachment/"+id;
              var attachment = findElementById($scope.email.attachments, id);
              $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType);
            }

            $scope.getSizeFile = function (file){
              return $filter('bytes')(file.size);
            }

            function removeMyself(){
              for(var i=0; i< $scope.email.destinatairesTo.length; i++){
                if($rootScope.myUser.id == $scope.email.destinatairesTo[i].id){
                  $scope.email.destinatairesTo.splice(i, 1);
                }
              }

              for(var i=0; i< $scope.email.destinatairesCc.length; i++){
                if($rootScope.myUser.id == $scope.email.destinatairesCc[i].id){
                  $scope.email.destinatairesCc.splice(i, 1);
                }
              }
            }

            function saveWithId(id){
              MessagerieServices.saveWithId($scope.email.id, getMailData()).then(function(resp){
                $scope.closePopover();
                $state.go("app.messagerie");
              }, function(err){
                $scope.showAlertError();
              });
            }

            function saveNewDraft(){
              MessagerieServices.saveNewDraft(getMailData()).then(function(resp){
                console.log(resp);
                $scope.email.id = resp.data.id;
                console.log($scope.email);
              }, function(err){
                $scope.showAlertError();
              });
            }

            function getMailData(){
              var newMail = {
                id: $scope.email.id,
                subject : $scope.email.sujet ? $scope.email.sujet: $rootScope.translationConversation["nosubject"],
                body : $scope.email.newMessage.replace(/\n/g, "<br/>") ? "<p>"+$scope.email.newMessage.replace(/\n/g, "<br/>")+"</p>"+$scope.email.corps: $scope.email.corps,
                to : getIdArray($scope.email.destinatairesTo),
                cc : getIdArray($scope.email.destinatairesCc),
                from : $rootScope.myUser.id
              };
              console.log(newMail);
              return newMail;
            }

            function getIdArray(array){
              var newArray = [];
              for(var i=0; i < array.length; i++){
                newArray.push(array[i]._id);
              }
              return newArray;
            }

            function addAllContactsTo (contactArray){
              for(var i =0; i<contactArray.length; i++){
                var contact = {
                  _id: contactArray[i],
                  displayName: $rootScope.getRealName(contactArray[i], $rootScope.historyMail.displayNames)
                }
                console.log(contact);
                $scope.email.destinatairesTo.push(contact);
              }
            }

            function headerReponse(){
              var from = $rootScope.historyMail.from[0].displayName;
              var date = $filter('date')($rootScope.historyMail.date, 'medium');
              var subject = $rootScope.historyMail.subject;

              var to="";
              for (var i = 0; i < $rootScope.historyMail.to.length; i++) {
                to += $rootScope.historyMail.to[i].displayName+" ";
              }

              var cc="";
              for (var i = 0; i < $rootScope.historyMail.cc.length; i++) {
                cc += $rootScope.historyMail.cc[i].displayName+" ";
              }

              var header = "<p class=\"row ng-scope\"></p>"+
              "<hr class=\"ng-scope\">"+
              "<p class=\"ng-scope\"></p>"+
              "<p class=\"medium-text ng-scope\">"+
              "<span translate=\"\" key=\"transfer.from\"><span class=\"no-style ng-scope\">De : </span></span><em class=\"ng-binding\">"+from+"</em>"+
              "<br>"+
              "<span class=\"medium-importance\" translate=\"\" key=\"transfer.date\"><span class=\"no-style ng-scope\">Date: </span></span><em"+ "class=\"ng-binding\">"+
              date+"</em> <br>"+
              "<span class=\"medium-importance\" translate=\"\" key=\"transfer.subject\"><span class=\"no-style ng-scope\">Objet : </span></span><em"+ "class=\"ng-binding\">"+subject+"</em>"+
              "<br>"+
              "<span class=\"medium-importance\" translate=\"\" key=\"transfer.to\"><span class=\"no-style ng-scope\">A : </span></span>"+
              "<em class=\"medium-importance\">"+to+"</em>"+
              "<br>"+
              "<span class=\"medium-importance\" translate=\"\" key=\"transfer.cc\"><span class=\"no-style ng-scope\">Copie à : </span></span>"+
              "<em class=\"medium-importance ng-scope\">"+cc+
              "</p><blockquote class=\"ng-scope\">"+
              "<p class=\"ng-scope\" style=\"font-size: 24px; line-height: 24px;\">";

              return header;

            }

            $scope.goToMessagerie = function () {
              $scope.closePopover();
              $state.go("app.messagerie");
            }

            $ionicPopover.fromTemplateUrl('messagerie/popover_messagerie_new.html', {
              scope: $scope
            }).then(function(popover) {
              $scope.popover = popover;
            });

            $scope.openPopover = function($event) {
              $scope.popover.show($event);
            };

            $scope.closePopover = function() {
              $scope.popover.hide();
            };

            //Cleanup the popover when we're done with it!
            $scope.$on('$destroy', function() {
              $scope.popover.remove();
            })
          })
          .directive('filterBox', function() {
            return {
              restrict: 'E',
              replace: true,
              scope: {
                getData: '&source',
                model: '=?',
                search: '=?filtertext',
                placeholder: '@'
              },
              link: function(scope, element, attrs) {
                attrs.minLength = attrs.minLength || 0;
                scope.placeholder = attrs.placeholder || '';
                scope.search = {value: ''};

                if (attrs.source) {
                  scope.$watch('search.value', function (newValue, oldValue) {
                    if (newValue.length > attrs.minLength) {
                      scope.getData({str: newValue}).then(function (results) {
                        scope.model = results;
                      });
                    } else {
                      scope.model = [];
                    }
                  });
                }

                scope.clearSearch = function() {
                  scope.search.value = '';
                };
              },
              template:
              ' <ion-input fixed-label id="filter-box">' +
              '<input type="search" ng-model="search.value" placeholder="{{placeholder}}" class="inputDestinataire">' +
              '</ion-input>'
            };
          })
          .filter('bytes', function() {
            return function(bytes, precision) {
              if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
              if (typeof precision === 'undefined') precision = 1;
              var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
              number = Math.floor(Math.log(bytes) / Math.log(1024));
              return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
            }
          });
