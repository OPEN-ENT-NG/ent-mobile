angular.module('ent.new_message', [])

.controller('NewMessageCtrl', function($scope, $http, $rootScope, $ionicPopover, $state, $ionicHistory, domainENT){

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
    $http({
      method: 'POST',
      url: domainENT+'/conversation/send',
      data: getMailData(),
      headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8" }
    }).then(function(resp){
      console.log("Success");
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  $scope.saveAsDraft = function(){
    var draftHasId = $scope.email.id !=0;
    $http(draftHasId ? saveWithId($scope.email.id):saveNewDraft).then(function(resp){
      alert("Success "+resp.data.id);
      $state.go("app.messagerie");
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  function saveWithId(id){
    return {
      method: 'PUT',
      url: domainENT+'/conversation/draft/'+$scope.email.id,
      data: getMailData(),
      headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8" }
    }
  }

  function saveNewDraft(){
    return {
      method:'POST',
      url: domainENT+'/conversation/draft',
      data: getMailData(),
      headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8" }
    }
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

  $ionicPopover.fromTemplateUrl('templates/popover_messagerie.html', {
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

  // $rootScope.contacts = [];
  // $rootScope.otherContacts =
  // {
  //
  //   groups:[
  //     {
  //       id: "73825-1452590663199",
  //       name: "Tous les gestionnnaires de la communauté a.",
  //       groupDisplayName: null,
  //       profile: null
  //
  //     },
  //     {
  //
  //       id: "73786-1452526764539",
  //       name: "Tous les gestionnnaires de la communauté test-forum.",
  //       groupDisplayName: null,
  //       profile: null
  //
  //     },
  //     {
  //
  //       id: "25371-1452097565207",
  //       name: "Tous les gestionnnaires de la communauté Test 4855.",
  //       groupDisplayName: null,
  //       profile: null
  //     }
  //   ],
  //   users: [
  //     {
  //
  //       id: "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
  //       displayName: "Aurélie DROUILLAC",
  //       groupDisplayName: null,
  //       profile: "Teacher"
  //
  //     },
  //     {
  //
  //       id: "91d042ed-b4d5-4dc8-bd97-fb0360c01f2b",
  //       displayName: "VINCENT CAILLET",
  //       groupDisplayName: null,
  //       profile: "Teacher"
  //
  //     },
  //     {
  //
  //       id: "19fee7e7-c10a-4730-a987-71931aab7199",
  //       displayName: "Andréa Ross",
  //       groupDisplayName: null,
  //       profile: "Student"
  //
  //     }
  //   ]
  // };
  //
  // $rootScope.transform = function(){
  //   for(var i = 0; i< $rootScope.otherContacts.groups.length; i++){
  //     $rootScope.contacts.push({
  //       _id:  $rootScope.otherContacts.groups[i].id,
  //       displayName:  $rootScope.otherContacts.groups[i].name,
  //       groupDisplayName:  $rootScope.otherContacts.groups[i].groupDisplayName,
  //       profile:  $rootScope.otherContacts.groups[i].profile
  //     });
  //   }
  //   for(var i = 0; i<  $rootScope.otherContacts.users.length; i++){
  //     $rootScope.contacts.push({
  //       _id:  $rootScope.otherContacts.users[i].id,
  //       displayName:  $rootScope.otherContacts.users[i].displayName,
  //       groupDisplayName:  $rootScope.otherContacts.users[i].groupDisplayName,
  //       profile:  $rootScope.otherContacts.users[i].profile
  //     });
  //   };
  //   for(var i = 0; i <  $rootScope.contacts.length; i++){
  //     console.log( $rootScope.contacts[i]);
  //
  //   }
  // }



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
