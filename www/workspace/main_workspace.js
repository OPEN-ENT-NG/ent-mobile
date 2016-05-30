angular.module('ent.workspace',['ent.workspace_service','ent.workspace_content', 'ent.workspace_trash','ent.workspace_folder_depth', 'ent.workspace_file', 'ent.workspace_move_file'])

.controller('MainWorkspaceCtrl', function($rootScope,  $ionicPopup){
  // $rootScope.folder_icon = localStorage.getItem('skin')+"/../../img/icons/folder.png"

  // $rootScope.createFolderError = function(error) {
  //
  //   console.log(error);
  //   var title = 'Erreur de connexion'
  //   var template = $rootScope.translationWorkspace[error.error]
  //   return $ionicPopup.alert({
  //     title: title,
  //     template: template
  //   })
  // }

  $rootScope.createFolderError = function(err) {
    console.log(err);
    // var title = 'Erreur de connexion'
    // var template = $rootScope.translationWorkspace[error.error]
    // return $ionicPopup.alert({
    //   title: title,
    //   template: template
    // })
  }

})
