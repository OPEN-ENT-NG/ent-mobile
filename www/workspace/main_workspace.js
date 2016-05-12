angular.module('ent.workspace',['ent.workspace_service','ent.workspace_content', 'ent.workspace_trash','ent.workspace_folder_depth', 'ent.workspace_file'])

.controller('MainWorkspaceCtrl', function($rootScope){
  $rootScope.folder_icon = localStorage.getItem('skin')+"/../../img/icons/folder.png"
})
