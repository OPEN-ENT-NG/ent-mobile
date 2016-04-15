angular.module('ent.new_message', ['ent.message_services', 'monospaced.elastic'])

.controller('NewMessageCtrl', function($scope, $rootScope, $ionicPopover, $state, $ionicHistory, MessagerieServices,$ionicLoading,$ionicPopup){

  $scope.email = {
    destinatairesTo: [],
    destinatairesCc: [],
    sujet: '',
    corps : '',
    id: 0
  };

  console.log("$rootScope.historyMail");
  console.log($rootScope.historyMail);
  switch($rootScope.historyMail.action){
    case "REPLY_ONE":
      console.log("switch reply one");
      $scope.email.destinatairesTo = getContactsNames([$rootScope.historyMail.from]);
      $scope.email.destinatairesCc = [];
      $scope.email.sujet = $rootScope.translationConversation["reply.re"]+$rootScope.historyMail.subject;
      $scope.email.corps= $rootScope.historyMail.body;
      $scope.email.id = $rootScope.historyMail.id;
      break;

      case "REPLY_ALL":
        console.log("switch reply_all");
        $scope.email.destinatairesTo = getContactsNames([$rootScope.historyMail.from]);
        $scope.email.destinatairesCc = getContactsNames($rootScope.historyMail.cc);
        $scope.email.sujet = $rootScope.translationConversation["reply.re"]+$rootScope.historyMail.subject;
        $scope.email.corps= $rootScope.historyMail.body;
        $scope.email.id = $rootScope.historyMail.id;
        break;

        case "FORWARD":
          console.log("switch forward");
          $scope.email.destinatairesTo = [];
          $scope.email.destinatairesCc = [];
          $scope.email.sujet = $rootScope.translationConversation["reply.fw"]+$rootScope.historyMail.subject;
          $scope.email.corps= $rootScope.historyMail.body;
          $scope.email.id = $rootScope.historyMail.id;
          break;

          case "DRAFT":
            console.log("switch draft");
            $scope.email.destinatairesTo = getContactsNames($rootScope.historyMail.to);
            $scope.email.destinatairesCc = getContactsNames($rootScope.historyMail.cc);
            $scope.email.sujet = $rootScope.historyMail.subject;
            $scope.email.corps= $rootScope.historyMail.body.replace(/\<br\/\>/g, "\n");
            $scope.email.id = $rootScope.historyMail.id;
            break;

            //draft
            default:
              console.log("switch new");
              break;
            }
            console.log("$scope.email");
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

            $scope.openFileChooser = function(){
              fileChooser.open(
                function(uri) {
                  alert(uri);
                },
                function(err){
                  alert('ERR:'+ err);
                });
              }

              $scope.saveAsDraft = function(){
                var draftHasId = $scope.email.id !=0;
                if($scope.email.id !=0){
                  saveWithId($scope.mail.id);
                } else{
                  saveNewDraft()
                }
              }

              function saveWithId(id){
                MessagerieServices.saveWithId($scope.email.id, getMailData()).then(function(resp){
                  $state.go("app.messagerie");
                }, function(err){
                  $scope.showAlertError();
                });
              }

              function saveNewDraft(){
                MessagerieServices.saveNewDraft(getMailData()).then(function(resp){
                  $state.go("app.messagerie");
                }, function(err){
                  $scope.showAlertError();
                });
              }

              function getContactsNames(idArray){
                console.log("idArray");
                console.log(idArray);
                var contactList =[];
                for(var j=0; j<idArray.length; j++){
                  var contact = [];
                  for(var i=0; i<$rootScope.historyMail.displayNames.length; i++){
                    console.log("idArray[j]: "+idArray[j]);
                    console.log("$rootScope.historyMail.displayNames[i][0]: "+$rootScope.historyMail.displayNames[i][0]);
                    if(idArray[j]  === $rootScope.historyMail.displayNames[i][0]){
                      contact._id = idArray[j];
                      contact.displayName=  $rootScope.historyMail.displayNames[i][1];
                      console.log(contact);
                      contactList.push(contact);
                    }
                  }
                }
                return contactList;
              }

              function getMailData(){

                var newMail = {
                  subject : $scope.email.sujet,
                  body : $scope.email.corps.replace(/\n/g, "<br/>"),
                  to : getIdArray($scope.email.destinatairesTo),
                  cc: getIdArray($scope.email.destinatairesCc),
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
                    displayName: $rootScope.getRealName(contactArray[i], $rootScope.historyMail)
                  }
                  console.log(contact);
                  $scope.email.destinatairesTo.push(contact);
                }
              }

              $scope.goToMessagerie = function () {
                $scope.closePopover();
                $ionicHistory.goBack();
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
                '<input type="search" ng-model="search.value" placeholder="{{placeholder}}" >' +
                '</ion-input>'
              };
            })
