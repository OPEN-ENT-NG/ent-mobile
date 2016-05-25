angular.module('ent.workspace_move_file',['ent.workspace_service', 'ion-tree-list'])

.controller('MoveDocCtrl', function($scope, $rootScope, WorkspaceService, $state, $ionicPopup, $ionicHistory){

  getFolders()

  function getFolders(){
    hierarchy = []
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
      $scope.tasks = hierarchy;
    })
  }

  $scope.$on('$ionTreeList:ItemClicked', function(event, item) {
    // process 'item'
    console.log(item.folder.folder);
    if(item.folder.folder == $rootScope.doc.folder){
      $scope.getAlertPopupNoTitle($rootScope.translationWorkspace["workspace.forbidden.move.folder.in.itself"])
    } else {
      $scope.getConfirmPopup($rootScope.translationWorkspace["move"], "Voulez-vous déplacer ce document dans le dossier "+item.folder.name+"?",$rootScope.translationWorkspace["cancel"],"OK").then(function(res){
        if(res!=null){
          WorkspaceService.moveDoc($rootScope.doc._id, item.folder.folder).then(function(res){
            console.log(res.data);
            $state.go('app.workspace',{nameWorkspaceFolder:'owner'})
          }, function(err){
            $scope.showAlertError()
          })
          $ionicHistory.goBack(-2);
          $ionicHistory.clear()
        }
      })
    }
  })



  $scope.$on('$ionTreeList:LoadComplete', function(event, items) {
    // process 'items'
  });

})
var hierarchy = []
var allFolders = []

var recursiveAddFolder = function(mainFolder, childFolder){
  if(mainFolder.folder.folder+'_'+childFolder.name == childFolder.folder){
    mainFolder.tree.push({folder: childFolder, name: childFolder.name, tree: []})
    allFolders.splice(allFolders.indexOf(childFolder),1)
  } else {
    if(mainFolder.tree.length>0){
      for(var k=0; k< mainFolder.tree.length; k++){
        recursiveAddFolder(mainFolder.tree[k], childFolder)
      }
    }
  }
}
