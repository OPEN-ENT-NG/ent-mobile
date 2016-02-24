angular.module('ent.new_message', ['ent.message_services'])

.controller('NewMessageCtrl', function($scope, $rootScope, $ionicPopover, $state, $ionicHistory, MessagerieServices){

  $scope.email=[];
  if($rootScope.historyMail){
    console.log("history not null ");
    $scope.email.corps= $scope.renderHtml($rootScope.historyMail.body);
    $scope.email.sujet = $rootScope.historyMail.subject;
    $scope.email.destinatairesTo = getContactsNames($rootScope.historyMail.to,$rootScope.historyMail.displayNames);
    $scope.email.destinatairesCc = getContactsNames($rootScope.historyMail.cc,$rootScope.historyMail.displayNames);
    $scope.email.id = $rootScope.historyMail.id;
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
    MessagerieServices.sendMail(getMailData()).then(function(resp){
      console.log("Success");
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  $scope.saveAsDraft = function(){
    var draftHasId = $scope.email.id !=0;
    MessagerieServices.saveAsDraft($scope.email.id , getMailData()).then(function(resp){
      $state.go("app.messagerie");
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  function getContactsNames(idArray, fullArray){
    var contactList =[];
    console.log("idArray "+idArray);
    for(var j=0; j<idArray.length; j++){
      var contact = [];
      for(var i=0; i<fullArray.length; i++){
        if(idArray[j]  === fullArray[i][0]){
          contact.id = idArray[j];
          contact.displayName=  fullArray[i][1];
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
      body : $scope.email.corps,
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
