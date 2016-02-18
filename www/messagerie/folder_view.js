angular.module('ent.messagerie', ['ent.message_services', 'ent.message_folder', 'ent.message_detail'])

.controller('MessagerieFoldersCtrl', function($scope,$state, $rootScope, MessagerieServices){

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
