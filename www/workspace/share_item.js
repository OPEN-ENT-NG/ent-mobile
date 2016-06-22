angular.module('ent.share_item',['ent.workspace_service','ent.message_services'])

.controller('ShareItemController', function($scope, $rootScope, $stateParams, $state,$ionicPosition, $ionicScrollDelegate, WorkspaceService, MessagerieServices, $ionicLoading){
  // MESSAEGERIE SERVICE UTILISER LURL DES CONTACT VISIBLE POUR TESTER LES PARTAGES
  //   this.getContactsService = function(){
    //   return $http.get(domainENT+"/conversation/visible");
    // }
  var idItems = $stateParams.idItems;
  $scope.headerList = "Partagé avec :" ;
  getContacts();
  getSharingItemDatas();

  function getContacts () {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.contactsGroup = [];
    $scope.contactsSolo = [];
    MessagerieServices.getContactsService().then(function(resp){
      for(var i = 0; i< resp.data.groups.length; i++){
        $scope.contactsGroup.push({
          _id:  resp.data.groups[i].id,
          displayName:  resp.data.groups[i].name,
          groupDisplayName:  resp.data.groups[i].groupDisplayName,
          profile:  resp.data.groups[i].status
        });
      }
      for(var i = 0; i<  resp.data.users.length; i++){
        $scope.contactsSolo.push({
          _id:  resp.data.users[i].id,
          displayName:  resp.data.users[i].displayName,
          groupDisplayName:  resp.data.users[i].groupDisplayName,
          profile:  resp.data.users[i].status
        });
      };
      $ionicLoading.hide();
    }, function(err){
        $scope.showAlertError();
    })
  }

  function getSharingItemDatas(){
    console.log(idItems);
    for(var i = 0 ; i < idItems.length ; i++){
      WorkspaceService.getSharingItemDatas(idItems).then(function(resp){
        // DO SOMETHING
      },function(err){
        console.log(err);
      })
    }
  }

  $scope.openFilters = function(){
    $scope.hasFilters = !$scope.hasFilters;
  }

  var posAntTop = 10000000 ;
  $scope.onScroll = function(){
    var positionGroupe = $ionicPosition.position(angular.element(document.getElementById("group")));
    console.log(positionGroupe.height);
    if(positionGroupe.top + positionGroupe.height > 0){
      if(posAntTop < 0){
        $scope.$apply(function(){ $scope.headerList = "Contacts par groupe";});
      }
    }else{
      if(posAntTop > 0){
        $scope.$apply(function(){ $scope.headerList = "Contacts";});
      }
    }
    posAntTop = positionGroupe.top + positionGroupe.height ;
  }

})
