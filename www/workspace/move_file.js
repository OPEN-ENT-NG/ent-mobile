angular.module('ent.workspace_move_file',['ent.workspace_service', 'ion-tree-list'])

.controller('MoveDocCtrl', function($scope, $rootScope, WorkspaceService, $state, $ionicHistory, $stateParams, CreateFolderPopUpFactory){

  var choosenFolder={}
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
          hierarchy.push({folder: res.data[i], name: res.data[i].name, tree: [], checked: false})
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
      $scope.tasks = [{
        folder: {folder: 'owner', name: $rootScope.translationWorkspace["documents"]},
        name: $rootScope.translationWorkspace["documents"],
        tree: hierarchy,
        checked: false
      }]
    })
  }

  $scope.$on('$ionTreeList:ItemClicked', function(event, item) {
    // process 'item'
    choosenFolder = item
  })

  $scope.$on('$ionTreeList:LoadComplete', function(event, items) {
    // process 'items'
  });

  $scope.newFolder = function(){
    console.log(choosenFolder);
    CreateFolderPopUpFactory.getPopup($scope).then(function(res) {
      if(res){
        WorkspaceService.createFolder(res, $rootScope.doc.folder).then(function(result){
          console.log(result.data);
          getFolders()
        }, function(error){
          $scope.showAlertError(error)
        })
      }
    });
  }

  $scope.selectFolder = function(){
    switch ($stateParams.action) {
      case 'move':
        moveItem(choosenFolder)
        break;
        case 'copy':
          copyItem(choosenFolder)
          break;
          default:
            break;
          }
        }

        function moveItem(item){
          if(item.folder.folder == $rootScope.doc.folder){
            $scope.getAlertPopupNoTitle($rootScope.translationWorkspace["workspace.forbidden.move.folder.in.itself"])
          } else {
            $scope.getConfirmPopup($rootScope.translationWorkspace["move"], "Voulez-vous déplacer ce document dans le dossier "+item.folder.name+"?",$rootScope.translationWorkspace["cancel"],"OK").then(function(res){
              if(res!=null){
                WorkspaceService.moveDoc($rootScope.doc._id, item.folder.folder).then(function(res){
                  $ionicHistory.goBack(-2);
                }, function(err){
                  $scope.showAlertError()
                })
              }
            })
          }
        }

        $scope.getTitle = function(){
          return $rootScope.translationWorkspace["workspace."+$stateParams.action]
        }

        function copyItem(item){

          $scope.getConfirmPopup($rootScope.translationWorkspace["workspace.copy"], "Voulez-vous copier ce document dans le dossier "+item.folder.name+"?",$rootScope.translationWorkspace["cancel"],"OK").then(function(res){
            if(res!=null){
              WorkspaceService.copyDoc($rootScope.doc._id, item.folder.folder).then(function(res){
                $ionicHistory.goBack(-2);
              }, function(err){
                $scope.showAlertError()
              })
            }
          })
        }

      })
      var hierarchy = []
      var allFolders = []

      function recursiveAddFolder (mainFolder, childFolder){
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
