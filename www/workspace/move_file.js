angular.module('ent.workspace_move_file', ['ent.workspace_service', 'ion-tree-list'])

  .controller('MoveDocCtrl', function ($scope, $rootScope, WorkspaceService, $state, $ionicPopup, $ionicHistory, $stateParams, CreateNewFolderPopUpFactory, MovingItemsFactory) {

    var choosenFolder = {};
    getFolders();

    var foldersToMove = MovingItemsFactory.getMovingFolders();
    var docsToMove = MovingItemsFactory.getMovingDocs();

    function getFolders() {
      rootFolders = [];
      WorkspaceService.getCompleteFoldersByFilter('owner').then(function (res) {
        //init: retrait de Trash et ajout des dossiers parents
        console.log(res);
        for (var i = 0; i < res.data.length; i++) {
          if (!res.data[i].folder.startsWith('Trash_')) {
            if (res.data[i].name === res.data[i].folder) {
              rootFolders.push({folder: res.data[i], name: res.data[i].name, tree: [], checked: false});
            } else {
              allFolders.push(res.data[i]);
            }
          }
        }
        for (var j = 0; j < rootFolders.length; j++) {
          recursiveAddFolder(rootFolders[j], allFolders);
        }

        //if (allFolders.length !== 0) {
        //  rootFolders.push({folder: "Non-définis", name: "Non-définis", tree: allFolders, checked: false});
        //  allFolders = [];
        //}

        $scope.tasks = [{
          folder: {folder: 'owner', name: $rootScope.translationWorkspace["documents"]},
          name: $rootScope.translationWorkspace["documents"],
          tree: rootFolders,
          checked: false
        }];
      })
    }

    $scope.$on('$ionTreeList:ItemClicked', function (event, item) {
      // process 'item'
      choosenFolder = item
    });

    $scope.$on('$ionTreeList:LoadComplete', function (event, items) {
      // process 'items'
    });

    function isEmpty(obj) {
      if (obj == null) return true;
      if (obj.length > 0)    return false;
      if (obj.length === 0)  return true;
      if (typeof obj !== "object") return true;
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
      }
      return true;
    }

    $scope.newFolder = function () {
      CreateNewFolderPopUpFactory.getPopup($scope).then(function (res) {
        if (res) {
          WorkspaceService.createFolder(res, isEmpty(choosenFolder) ? 'owner' : choosenFolder.folder).then(function (result) {
            console.log(result.data);
            getFolders()
          }, function (error) {
            $rootScope.createFolderError(error)
          })
        }
      });
    };

    function moveItem(item) {
      $scope.getConfirmPopup($rootScope.translationWorkspace["move"], "Voulez-vous déplacer ce document dans le dossier " + item.folder.name + "?", $rootScope.translationWorkspace["cancel"], "OK").then(function (response) {
        if (response != null) {
          WorkspaceService.moveSelectedFolders(foldersToMove, item.folder.folder).then(function (res) {
            WorkspaceService.moveSelectedDocs(docsToMove, item.folder.folder).then(function (response) {
              $ionicHistory.goBack();
            }, function (err) {
              $scope.showAlertError()
            })
          })
        }
      })
    }

    function copyItem(item) {
      $scope.getConfirmPopup($rootScope.translationWorkspace["workspace.copy"], "Voulez-vous copier ce document dans le dossier " + item.folder.name + "?", $rootScope.translationWorkspace["cancel"], "OK").then(function (response) {
        if (response != null) {
          WorkspaceService.copySelectedFolders(foldersToMove, item.folder.folder).then(function (res) { //tmp
            console.log(res);
            WorkspaceService.copySelectedDocs(docsToMove, item.folder.folder).then(function (result) {
              console.log(result);
              $ionicHistory.goBack();
            }, function (err) {
              $scope.showAlertError()
            })
          })
        }
      })
    }

    $scope.getTitle = function () {
      return $rootScope.translationWorkspace["workspace." + $stateParams.action]
    };

    $scope.selectFolder = function () {
      switch ($stateParams.action) {
        case 'move':
          moveItem(choosenFolder);
          break;
        case 'copy':
          copyItem(choosenFolder);
          break;
        default:
          break;
      }
    }

  });
var rootFolders = [];
var allFolders = [];

// function recursiveAddFolder (mainFolder, childFolder){
//   if(mainFolder.folder.folder+'_'+childFolder.name == childFolder.folder){
//     mainFolder.tree.push({folder: childFolder, name: childFolder.name, tree: []})
//     allFolders.splice(allFolders.indexOf(childFolder),1)
//   } else {
//     if(mainFolder.tree.length>0){
//       for(var k=0; k< mainFolder.tree.length; k++){
//         recursiveAddFolder(mainFolder.tree[k], childFolder)
//       }
//     }
//   }
// }

function recursiveAddFolder(mainFolder, folders) {
  folders.forEach(function (childFolder, index) {
    if (mainFolder.folder.folder + '_' + childFolder.name === childFolder.folder) {
      var childItem = {folder: childFolder, name: childFolder.name, tree: []};
      mainFolder.tree.push(childItem);
      delete allFolders[index];
      recursiveAddFolder(childItem, allFolders);
    }
  });
}
