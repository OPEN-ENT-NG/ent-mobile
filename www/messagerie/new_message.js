angular.module('ent.new_message', ['ent.message_services', 'monospaced.elastic','textAngular'])

.controller('NewMessageCtrl', function($scope, $rootScope, $ionicPopover, $state, $ionicHistory, MessagerieServices,$ionicLoading,$ionicPopup){

  $scope.email=[];
  if($rootScope.historyMail){
    console.log("$rootScope.historyMail");
    console.log($rootScope.historyMail);

    if($rootScope.historyMail.action ==="DRAFT"){
      $scope.email.corps= $scope.renderHtml($rootScope.historyMail.body.replace(/\<br\/\>/g, "\n"));
    } else {
      $scope.email.corps= $scope.renderHtml($rootScope.historyMail.body)
    }

    $scope.email.sujet = $rootScope.historyMail.subject;
    $scope.email.destinatairesTo = getContactsNames($rootScope.historyMail.to,$rootScope.historyMail.displayNames);
    $scope.email.destinatairesCc = getContactsNames($rootScope.historyMail.cc,$rootScope.historyMail.displayNames);
    $scope.email.from = getContactsNames([$rootScope.getRealName ($rootScope.historyMail.from, $rootScope.historyMail)], $rootScope.historyMail.displayNames);
    $scope.email.action = $rootScope.historyMail.action;

    $scope.email.id = $rootScope.historyMail.id;
    console.log($scope.email);
    switch($rootScope.historyMail.action){
      case "REPLY_ONE":
        console.log("switch");
        $scope.email.destinatairesTo = $scope.email.from ;
        $scope.email.destinatairesCc = [];
        break;

        case "REPLY_ALL":
          console.log("switch");
          $scope.email.destinatairesTo = $scope.email.from ;
          break;

          case "FORWARD":
            console.log("switch");
            $scope.email.destinatairesCc = [];
            $scope.email.destinatairesTo = [];
            break;

            default:
              console.log("switch default");
              break;
            }

          } else {
            console.log("no history");
            $scope.email = {
              destinatairesTo: [],
              destinatairesCc: [],
              sujet: '',
              corps : '',
              id: 0
            };
          }

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

            function getContactsNames(idArray, fullArray){
              var contactList =[];
              for(var j=0; j<idArray.length; j++){
                var contact = [];
                for(var i=0; i<fullArray.length; i++){
                  if(idArray[j]  === fullArray[i][0]){
                    contact.id = idArray[j];
                    contact.displayName=  fullArray[i][1];
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

            $scope.goToMessagerie = function () {
              $scope.closePopover();
              $ionicHistory.goBack();
            }

            $ionicPopover.fromTemplateUrl('messagerie/popover_messagerie.html', {
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
              ' <ion-input fixed-label id="filter-box" class=" item-input">' +
              // '<span class="input-label">{{placeholder}}</span>'+
              '<input type="search" ng-model="search.value" placeholder="{{placeholder}}" >' +
              '</div>'

              // '<label class=" item-input item-floating-label" id="filter-box">'+
              // '<span class="input-label">{{placeholder}}</span>'+
              // '<input type="search" ng-model="search.value" placeholder="{{placeholder}}">'+
              // '</label>'
            };
          })
