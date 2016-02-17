angular.module('ent.message_folder', [])

.service('FolderContentService', function($http){
  this.getMessagesFolder = function (url) {
    return $http.get(url);
  }
})

.controller('InboxCtrl', function($scope, $state, $stateParams, $rootScope, domainENT, FolderContentService,  $ionicLoading){
  var url = "";
  var regularFolders = ["INBOX", "OUTBOX", "TRASH", "DRAFT"];

  updateMessages();

  $scope.doRefreshMessages = function() {
    $scope.messages.unshift(getMessages(url));
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  $scope.getRealName = function(id, message){
    var returnName = "Inconnu";
    for(var i = 0; i< message.displayNames.length; i++){
      if(id == message.displayNames[i][0]){
        returnName = message.displayNames[i][1];
      }
    }
    return returnName;
  }
  function updateMessages(){
    getUrlFolder();
    getMessages(url);
  }

  function getUrlFolder (){
    if(regularFolders.indexOf($stateParams.nameFolder)>-1){
      url=domainENT+"/conversation/list/"+$stateParams.nameFolder;
      $rootScope.nameFolder = $stateParams.nameFolder;
    } else {
      url=domainENT+"/conversation/list/"+localStorage.getItem("messagerie_folder_id")+"?restrain=&page=0";
      $rootScope.nameFolder = localStorage.getItem("messagerie_folder_name");
    }
  }

  function getMessages (url){

    $ionicLoading.show({
      template: 'Chargement en cours...'
    });
    FolderContentService.getMessagesFolder(url).then(function (response) {
      $scope.messages = response.data;
      $ionicLoading.hide();

    }, function(err){
      alert('ERR:'+ err);
    });
  };
});
