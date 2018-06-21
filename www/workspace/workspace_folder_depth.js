angular.module('ent.workspace_folder_depth',['ent.workspace_service'])

.controller('WorkspaceFolderDepthCtlr', function($scope, $rootScope, $stateParams, $state, WorkspaceService, $ionicLoading, MimeTypeFactory, CreateNewFolderPopUpFactory, $ionicPopover,$ionicPlatform, $ionicHistory, RenamePopUpFactory, MovingItemsFactory){

  var fullFolderName = $stateParams.nameFolder.length !=0 ? $stateParams.parentFolderName + '_' + $stateParams.nameFolder : $stateParams.parentFolderName;

  getData();

  $scope.doRefresh = function(){
    getData()
    $scope.$broadcast('scroll.refreshComplete')
    $scope.$apply()
  }

  $scope.copySelectedItems = function() {
    $scope.closePopover()
    $rootScope.checkable = false
    MovingItemsFactory.setMovingDocs(getCheckedDocuments($scope.documents))
    MovingItemsFactory.setMovingFolders(getCheckedFolders($scope.folders))
    $state.go('app.workspace_tree', {action:'copy'})
  }

  $scope.moveSelectedItems = function() {
    $scope.closePopover()
    $rootScope.checkable = false
    MovingItemsFactory.setMovingDocs(getCheckedDocuments($scope.documents))
    MovingItemsFactory.setMovingFolders(getCheckedFolders($scope.folders))
    $state.go('app.workspace_tree', {action:'move'})
  }


  $scope.getTitle = function(){
    return $stateParams.nameFolder.length !=0 ? $stateParams.nameFolder:$stateParams.parentFolderName;
  }

  $scope.gotInDepthFolder = function(folder){
    $state.go('app.workspace_folder_depth', {filtre:$stateParams.filtre, parentFolderName: fullFolderName, nameFolder: folder.name})
  }

  $scope.goToFile = function (doc) {
    doc.folder = $stateParams.nameFolder.length !=0 ? $stateParams.nameFolder:doc.folder
    $rootScope.doc = doc
    $state.go('app.workspace_file', {filtre:$stateParams.filtre})
  }

  $scope.newFolder = function(){
    CreateNewFolderPopUpFactory.getPopup($scope).then(function(res) {
      if(res){
        WorkspaceService.createFolder(res,fullFolderName).then(function(result){
          console.log(result.data);
          getData()
        }, function(error){
          $rootScope.createFolderError(error)
        })
      }
    });
  }

  $scope.renameItem = function(){

    if(getCheckedFolders($scope.folders).length>0 ){
      item = getCheckedFolders($scope.folders)[0]
      type = 'folder'
    } else {
      item = getCheckedDocuments($scope.documents)[0]
      type = 'document'
    }
    console.log(item);
    RenamePopUpFactory.getPopup($scope, item).then(function(resp){
      console.log(resp);
      if(resp){
        WorkspaceService.renameItem(item, type, resp).then(function(response){
          console.log(response)
          $scope.closePopover()
          $rootScope.checkable = false
          getData()
        }, function(err){
          $ionicLoading.hide()
          $scope.showAlertError()
        })
      }
    })
  }

  $scope.addDocument = function(ele){

    var newDoc = ele.files[0];
    console.log(newDoc);

    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });

    var formData = new FormData()
    formData.append('file', newDoc)
    WorkspaceService.uploadDoc(formData).then(function(result){
      console.log(result);
      console.log(fullFolderName);
      WorkspaceService.moveDoc(result.data._id, fullFolderName).then(function(res){
        console.log(res);
        WorkspaceService.getDocumentsByFolderAndFilter(fullFolderName, $stateParams.filtre).then(function(result){
          for(var i=0; i<result.data.length;i++){
            $scope.documents.push(MimeTypeFactory.setIcons(result.data[i]));
          }
        })
      })
      $ionicLoading.hide();
    }, function(err){
      $ionicLoading.hide();
      $scope.showAlertError()
    });
  }

  $scope.onlyOneFolder = function(){
    if($rootScope.checkable){
      return getCheckedFolders($scope.folders).length ==1 && getCheckedDocuments($scope.documents).length ==0
    }
  }

  $scope.deleteSelectedItems = function(){
    var checkedItems = getCheckedItems($scope.folders, $scope.documents)
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.closePopover()
    WorkspaceService.deleteSelectedFolders(checkedItems.folders, $rootScope.isMyDocuments()).then(function(res){
      console.log(res);
      WorkspaceService.deleteSelectedDocuments(checkedItems.documents).then(function(response){
        console.log(response);
        getData()
        $rootScope.checkable = false
      })
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }

  $ionicPopover.fromTemplateUrl('workspace/popover_hierarchy.html', {
    scope: $scope
  }).then(function(popover) {
    $rootScope.popover = popover;
  });

  var doCustomBack= function() {
    if($rootScope.checkable){
      $rootScope.checkable = false;
      setUnchecked($scope.folders)
      setUnchecked($scope.documents)
      $rootScope.$apply();
    } else {
      $ionicHistory.goBack();
    }
  };

  var deregisterHardBack= $ionicPlatform.registerBackButtonAction(doCustomBack, 1001);
  $scope.$on('$destroy', function() {
    deregisterHardBack();
  });

  $scope.isDocImage = function(metadata)
  {
    if (metadata == 0 || metadata == undefined) {
      return 'false';
    }
    if (metadata['content-type'].indexOf("image") != -1) {
      return 'true';
    }
    return 'false';
  }

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    })
    $scope.documents = []
    $scope.folders = []

    WorkspaceService.getCompleteFoldersByFilter($stateParams.filtre).then(function(res){

      for(var i=0; i<res.data.length;i++){
        var folder = res.data[i]

        if(res.data[i].folder.startsWith(fullFolderName+'_')){
          var childFolderName = folder.folder.slice(fullFolderName.length+1)
          if(childFolderName == folder.name){
            $scope.folders.push(folder)
          }
        }
      }
      WorkspaceService.getDocumentsByFolderAndFilter(fullFolderName, $stateParams.filtre).then(function(result){
        for(var i=0; i<result.data.length;i++){
          $scope.documents.push(MimeTypeFactory.setIcons(result.data[i]));
        }
      })
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }
})
