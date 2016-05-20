angular.module('ent.messagerie', ['ent.message_services', 'ent.message_folder', 'ent.message_detail', 'ent.new_message'])

.controller('MessagerieFoldersCtrl', function($scope, $state, $rootScope, MessagerieServices,  $ionicLoading,  $cordovaVibration, $ionicPlatform, $ionicHistory){


  getContacts();
  getFolders();

  $rootScope.getRealName = function (id, displayNames){
    var returnName = "Inconnu";
    for(var i = 0; i< displayNames.length; i++){
      if(id == displayNames[i][0]){
        returnName = displayNames[i][1];
      }
    }
    return returnName;
  }

  $rootScope.getNameFolder = function(nameFolder){
    var nonPersonnalFolders = ["inbox", "outbox", "draft", "trash"];
    return nonPersonnalFolders.indexOf(nameFolder) != -1 ? $rootScope.translationConversation[nameFolder]:nameFolder;
  }

  $rootScope.newMail = function(){
    $rootScope.historyMail = "";
    $state.go("app.new_message");
  }

  $scope.doRefreshFolders = function() {
    $scope.folders.unshift(getFolders());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  }

  $scope.goToFolder = function(folder){
    $state.go("app.message_folder", {nameFolder: folder.name, idFolder:folder.id})
  }

  function getFolders(){

    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });

    $scope.checkable = false;
    $scope.folders = [];
    $scope.folders = MessagerieServices.getNonPersonalFolders();
    $scope.folders.push({
      id: "0",
      name:""

    });
    MessagerieServices.getCustomFolders().then(function(resp){
      for(var i = 0; i< resp.data.length; i++){
        $scope.folders.push({
          id: resp.data[i].id,
          name: resp.data[i].name
        });
      }
    }).then(function(){
      var folderIds = [];
      angular.forEach($scope.folders, function(folder) {
        folderIds.push(folder.id);
      })
      MessagerieServices.getCountUnread(folderIds).then(function (response){
        for(var i=0; i< response.length; i++){
          console.log($scope.folders[i].name);
          console.log(response[i].count);
          $scope.folders[i].count = response[i].count;
        }
        initCheckedValue();
        console.log($scope.folders);
        $ionicLoading.hide();
      })
    }) , function(err){
      $ionicLoading.hide();
      $scope.showAlertError();
    };
  }

  function initCheckedValue(){
    angular.forEach($scope.folders, function(folder){
      folder.checked = false;
    });
  }

  function getContacts () {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
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
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError();
    });
  }
})
.directive('onLongPress', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $elm, $attrs) {
      $elm.bind('touchstart', function(evt) {
        // Locally scoped variable that will keep track of the long press
        $scope.longPress = true;

        // We'll set a timeout for 600 ms for a long press
        $timeout(function() {
          if ($scope.longPress) {
            // If the touchend event hasn't fired,
            // apply the function given in on the element's on-long-press attribute
            $scope.$apply(function() {
              $scope.$eval($attrs.onLongPress)
            });
          }
        }, 600);
      });

      $elm.bind('touchend', function(evt) {
        // Prevent the onLongPress event from firing
        $scope.longPress = false;
        // If there is an on-touch-end function attached to this element, apply it
        if ($attrs.onTouchEnd) {
          $scope.$apply(function() {
            $scope.$eval($attrs.onTouchEnd)
          });
        }
      });
    }
  };
});
