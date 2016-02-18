angular.module('ent.messagerie', ['ent.message_services'])

.controller('MessagerieFoldersCtrl', function($scope,$state, $rootScope, MessagerieServices){

console.log("MessagerieFoldersCtrl");
  getContacts();
  getFolders();

  $scope.setCurrentFolder = function (index){
    localStorage.setItem('messagerie_folder_name',$scope.folders[index].name);
    localStorage.setItem('messagerie_folder_id',$scope.folders[index].id);
  }

  $rootScope.newMail = function(){
    $rootScope.historyMail = null;
    $state.go("app.new_message");
  }


  $scope.doRefreshFolders = function() {
    $scope.folders.unshift(getFolders());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getFolders(){
    $scope.folders = [];
    MessagerieServices.getCustomFolders().then(function(resp){
      $scope.folders  = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  function getContacts () {
    $rootScope.contacts = [];
    MessagerieServices.getContactsService().then(function(resp){
      for(var i = 0; i< resp.data.groups.length; i++){
        $rootScope.contacts.push({
          _id:  resp.data.groups[i].id,
          displayName:  resp.data.groups[i].name,
          groupDisplayName:  resp.data.groups[i].groupDisplayName,
          profile:  resp.data.groups[i].status
        });
      }
      for(var i = 0; i<  resp.data.users.length; i++){
        $rootScope.contacts.push({
          _id:  resp.data.users[i].id,
          displayName:  resp.data.users[i].displayName,
          groupDisplayName:  resp.data.users[i].groupDisplayName,
          profile:  resp.data.users[i].status
        });
      };
    }, function(err){
      alert('ERR:'+ err);
    });
  }
});
