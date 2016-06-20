angular.module('ent.share_item',['ent.workspace_service','ent.message_services'])

.controller('ShareItemController', function($scope, $rootScope, $stateParams, $state, WorkspaceService, MessagerieServices, $ionicLoading){
  // MESSAEGERIE SERVICE UTILISER LURL DES CONTACT VISIBLE POUR TESTER LES PARTAGES
  //   this.getContactsService = function(){
    //   return $http.get(domainENT+"/conversation/visible");
    // }
  var idItems = $stateParams.idItems;
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
      WorkspaceService.getSharingItemDatas(idItems[i]).then(function(resp){
        console.log(resp);
      },function(err){
        console.log(err);
      })
    }
  }
})
