angular.module('ent.workspace_content',['ent.workspace_service',])

.controller('WorkspaceFolderContentCtlr', function($scope, $rootScope, $stateParams, $state, WorkspaceService, $ionicLoading, MimeTypeFactory, $cordovaProgress, CreateNewFolderPopUpFactory, $ionicPopup, $cordovaVibration, $ionicHistory, $ionicPlatform, $ionicPopover, RenamePopUpFactory, MovingItemsFactory){

  var filter = getFilter($stateParams.nameWorkspaceFolder)
  $rootScope.checkable = false
  getData()


  $rootScope.isMyDocuments = function(){
    return $stateParams.nameWorkspaceFolder == "documents"
  }

  $rootScope.getCopyExpression = function(){
    if($rootScope.isMyDocuments()){
      return $rootScope.translationWorkspace["workspace.copy"]
    } else {
      return $rootScope.translationWorkspace["workspace.move.racktodocs"]
    }
  }

  $rootScope.enableCheck = function (item) {
    console.log($rootScope.checkable);
    if(!$rootScope.checkable){
      $cordovaVibration.vibrate(100)     // Vibrate 100ms
      $rootScope.checkable = true
      item.checked = true
    }
    console.log($rootScope.checkable);

  }

  $scope.newFolder = function(){
    CreateNewFolderPopUpFactory.getPopup($scope).then(function(res) {
      if(res){
        WorkspaceService.createFolder(res,'owner').then(function(result){
          console.log(result.data);
          getData()
        }, function(error){
          console.log(error);
          $rootScope.createFolderError(error)
        })
      }
    });
  }


  $scope.addDocument = function(ele){
    var newDoc = ele.files[0];
    // mfbMenu.close();
    console.log(newDoc);

    if(newDoc.size > $rootScope.translationWorkspace["max.file.size"]){
      $scope.getAlertPopupNoTitle($rootScope.translationWorkspace["file.too.large.limit"]+ $scope.getSizeFile(parseInt($rootScope.translationWorkspace["max.file.size"])))
    } else {
      $cordovaProgress.showSimpleWithLabelDetail(true, "Ajout en cours", newDoc.name);

      var formData = new FormData()
      formData.append('file', newDoc)
      WorkspaceService.uploadDoc(formData).then(function(result){
        console.log(result);
        var menu = document.getElementById('actionMenu')
        console.log(menu);
        // menu.close();

        WorkspaceService.getDocumentsByFilter(filter, filter==="owner").then(function(result){
          $scope.documents = []
          for(var i=0; i<result.data.length;i++){
            $scope.documents.push(MimeTypeFactory.setIcons(result.data[i]));
          }
          console.log("files: "+$scope.documents.length);
        })
        $cordovaProgress.hide()
      }, function(err){
        $cordovaProgress.hide()
        $scope.showAlertError()
      });
    }
  }

  $scope.doRefresh = function(){
    getData()
    $scope.$broadcast('scroll.refreshComplete')
    $scope.$apply()
  }

  $scope.getTitle = function(){
    if($rootScope.checkable){
      var checkedItems = getCheckedItems($scope.folders, $scope.documents)
      var count = checkedItems.folders.length + checkedItems.documents.length
    }
    return $rootScope.checkable ? count:$rootScope.translationWorkspace[$stateParams.nameWorkspaceFolder]
  }

  $scope.gotInDepthFolder = function(folder){
    $state.go('app.workspace_folder_depth', {filtre:filter, parentFolderName: folder.name})
  }

  $scope.goToFile = function (doc) {
    if(!doc.hasOwnProperty('folder')){
      doc.folder = $rootScope.translationWorkspace[$stateParams.nameWorkspaceFolder]
    }
    $rootScope.doc = doc
    $state.go('app.workspace_file', {filtre:filter, folder:$stateParams.nameWorkspaceFolder})
  }

  $scope.deleteSelectedItems = function(){
    var checkedItems = getCheckedItems($scope.folders, $scope.documents)
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.closePopover()
    WorkspaceService.deleteSelectedFolders(checkedItems.folders, $rootScope.isMyDocuments()).then(function(res){
      console.log(res);
      WorkspaceService.deleteSelectedDocuments(checkedItems.documents, $rootScope.isMyDocuments()).then(function(response){
        console.log(response);
        getData()
        $rootScope.checkable = false
      })
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
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

  $scope.onlyOneFolder = function(){
    if($rootScope.checkable){
      return getCheckedFolders($scope.folders).length ==1 && getCheckedDocuments($scope.documents).length ==0
    }
  }

  $ionicPopover.fromTemplateUrl('workspace/popover_hierarchy.html', {
    scope: $scope
  }).then(function(popover) {
    $rootScope.popover = popover;
  });

  $rootScope.$ionicGoBack = function() {
    if($rootScope.checkable){
      $rootScope.checkable = false;
      setUnchecked($scope.folders)
      setUnchecked($scope.documents)
    } else {
      $ionicHistory.goBack();
    }
  };

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

  var deregisterHardBack= $ionicPlatform.registerBackButtonAction(doCustomBack, 101);
  $scope.$on('$destroy', function() {
    deregisterHardBack();
  });


  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.getDocumentsByFilter(filter, filter==="owner").then(function(result){
      $scope.documents = []
      for(var i=0; i<result.data.length;i++){
        $scope.documents.push(MimeTypeFactory.setIcons(result.data[i]))
        $scope.documents[i].checked = false
      }
      console.log("files: "+$scope.documents.length);
      console.log($scope.documents);
      if(filter!="appDocuments"){
        getFolders(filter)
      }
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }

  function getFolders(filter){
    WorkspaceService.getFoldersByFilter(filter, filter=="owner").then(function(res){
      $scope.folders = res.data;
      for(var i=0; i<$scope.folders.length;i++){
        $scope.folders[i].checked = false;
      }
      console.log("folders: "+$scope.folders.length)
    })
  }

  $rootScope.createFolderError = function(error) {
    console.log(error);
    var title = 'Erreur de connexion'
    var template = $rootScope.translationWorkspace[error.data.error]
    return $ionicPopup.alert({
      title: title,
      template: template
    })
  }
})
