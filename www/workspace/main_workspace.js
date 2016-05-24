angular.module('ent.workspace',['ent.workspace_service','ent.workspace_content', 'ent.workspace_trash','ent.workspace_folder_depth', 'ent.workspace_file', 'ion-tree-list'])

.controller('MainWorkspaceCtrl', function($scope, $rootScope, WorkspaceService, $filter){
  // $rootScope.folder_icon = localStorage.getItem('skin')+"/../../img/icons/folder.png"

  WorkspaceService.getCompleteFoldersByFilter('owner').then(function(res){


    // $scope.tasks = [
    //   {
    //     name: 'first task 1',
    //     tree: [
    //       {
    //         name: 'first task 1.1'
    //       }
    //     ]
    //   },
    //   {
    //     name: 'first task 2'
    //   }
    // ];
    $scope.tasks = []
    var hierarchy = []
    var parentsNameArray = []

    var allFolders = []

    //init: retrait de Trash et ajout des dossiers parents
    for(var i=0; i<res.data.length;i++){
      if(!res.data[i].folder.startsWith('Trash_')){
        allFolders.push(res.data[i])
      }

      // if(res.data[i].name == res.data[i].folder){
      //   hierarchy.push({folder: res.data[i], name: res.data[i].name})
      //   parentsNameArray.push(res.data[i].name)
      //   allFolders.splice(i,1)
      // }
    }
    console.log(allFolders);
    var orderBy = $filter('orderBy');

    hierarchy = orderBy(allFolders, folder)
    console.log(hierarchy);

    // for(var i=0; i<allFolders.length;i++){
    //   var item = allFolders[i]
    //   console.log(item);
    //   var parentName = item.folder.slice(0, item.folder.indexOf(item.name))
    //   if(parentName.endsWith('_')){
    //     parentName = parentName.slice(0, parentName.length-1)
    //   }
    //   console.log('parentName:' + parentName);
    //
    //   if(parentsNameArray.indexOf(parentName) > -1){ //niveau 1
    //     console.log(hierarchy[parentsNameArray.indexOf(parentName)]);
    //     if(hierarchy[parentsNameArray.indexOf(parentName)].hasOwnProperty('tree')){
    //       hierarchy[parentsNameArray.indexOf(parentName)].tree.push({folder: item, name: item.name})
    //     } else {
    //       hierarchy[parentsNameArray.indexOf(parentName)].tree = [{folder: item, name: item.name}]
    //     }
    //     allFolders.splice(i, 1)
    //   } else {
    //     //check les tree
    //   }

    // var depth =0;
    // while (allFolders.length>0) {
    //   // var rest = allFolders;
    //   for(var i=0; i<allFolders.length;i++){
    //     var item = allFolders[i]
    //     console.log(item);
    //     var parentName = item.folder.slice(0, item.folder.indexOf(item.name))
    //     if(parentName.endsWith('_')){
    //       parentName = parentName.slice(0, parentName.length-1)
    //     }
    //     console.log('parentName:' + parentName);
    //
    //     if(parentsNameArray.indexOf(parentName) > -1){ //niveau 1
    //       console.log(hierarchy[parentsNameArray.indexOf(parentName)]);
    //       if(hierarchy[parentsNameArray.indexOf(parentName)].hasOwnProperty('tree')){
    //         hierarchy[parentsNameArray.indexOf(parentName)].tree.push({folder: item, name: item.name})
    //       } else {
    //         hierarchy[parentsNameArray.indexOf(parentName)].tree = [{folder: item, name: item.name}]
    //       }
    //       allFolders.splice(i, 1)
    //     } else {
    //       //check les tree
    //     }
    //   }
    //   depth++;
    // }
    console.log(hierarchy);
    $scope.tasks = hierarchy
  })

  $scope.$on('$ionTreeList:ItemClicked', function(event, item) {
    // process 'item'
    console.log(item);
  });

  $scope.$on('$ionTreeList:LoadComplete', function(event, items) {
    // process 'items'
    console.log(items);
  });

})
