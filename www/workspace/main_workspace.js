angular.module('ent.workspace',['ent.workspace_service','ent.workspace_content', 'ent.workspace_trash','ent.workspace_folder_depth', 'ent.workspace_file', 'ion-tree-list'])

.controller('MainWorkspaceCtrl', function($scope, $rootScope, WorkspaceService, $filter){
  // $rootScope.folder_icon = localStorage.getItem('skin')+"/../../img/icons/folder.png"

  getFolders()

  function getFolders(){
    $scope.tasks = []
    hierarchy = []
    allFolders = []

    WorkspaceService.getCompleteFoldersByFilter('owner').then(function(res){
      //init: retrait de Trash et ajout des dossiers parents
      for(var i=0; i<res.data.length;i++){
        if(!res.data[i].folder.startsWith('Trash_')){
          allFolders.push(res.data[i])
        }

        if(res.data[i].name == res.data[i].folder){
          hierarchy.push({folder: res.data[i], name: res.data[i].name, tree: []})
          allFolders.splice(allFolders.indexOf(res.data[i]),1)
        }
      }

      while(allFolders.length != 0){
        for(var i=0; i<hierarchy.length; i++){
          for(j=0;j<allFolders.length;j++){
            if(allFolders[j].folder.startsWith(hierarchy[i].folder.folder)){
              recursiveAddFolder(hierarchy[i], allFolders[j])
            }
          }
        }
      }
      console.log(allFolders);
      console.log(hierarchy);
      $scope.tasks = hierarchy
    })
  }

  $scope.$on('$ionTreeList:ItemClicked', function(event, item) {
    // process 'item'
    console.log(item);
  });

  $scope.$on('$ionTreeList:LoadComplete', function(event, items) {
    // process 'items'
    console.log(items);
  });

})
var hierarchy = []
var allFolders = []
var recursiveAddFolder = function(mainFolder, childFolder){
  if(mainFolder.folder.folder+'_'+childFolder.name == childFolder.folder){
    mainFolder.tree.push({folder: childFolder, name: childFolder.name, tree: []})
    allFolders.splice(allFolders.indexOf(childFolder),1)
    console.log(mainFolder);
  } else {
    if(mainFolder.tree.length>0){
      for(var k=0; k< mainFolder.tree.length; k++){
        recursiveAddFolder(mainFolder.tree[k], childFolder)
      }
    }
  }
}
