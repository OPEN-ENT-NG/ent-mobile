angular.module('ent.workspace_content',['ent.workspace_service',])

.controller('WorkspaceFolderContentCtlr', function($scope, $rootScope, $stateParams, $state, WorkspaceService, $ionicLoading, MimeTypeFactory, $cordovaProgress, CreateNewFolderPopUpFactory, $ionicPopup, $cordovaVibration, $ionicHistory, $ionicPlatform, $ionicPopover){

  var filter = getFilter($stateParams.nameWorkspaceFolder)
  $rootScope.checkable = false
  getData()


  $rootScope.isMyDocuments = function(){
    return $stateParams.nameWorkspaceFolder == "documents"
  }

  $rootScope.enableCheck = function (item) {
    if(!$rootScope.checkable){
      $cordovaVibration.vibrate(100)     // Vibrate 100ms
      $rootScope.checkable = true
      item.checked = true
    }
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
    var checkedItems = getCheckedItems($scope.folders, $scope.documents)
    var count = checkedItems.folders.length + checkedItems.documents.length
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
    WorkspaceService.deleteSelectedFolders(checkedItems.folders).then(function(res){
      console.log(res);
      WorkspaceService.deleteSelectedDocuments(checkedItems.documents).then(function(response){
        console.log(response);
        getData()
        $rootScope.checkable = false
        // _.each($scope.rowData, function(item){ item.item.Hr = 25;});
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


  $rootScope.$ionicGoBack = function() {
    if($rootScope.checkable){
      $rootScope.checkable = false;
      // initCheckedValue();
    } else {
      $ionicHistory.goBack();
    }
  };

  var doCustomBack= function() {
    if($rootScope.checkable){
      $rootScope.checkable = false;
      // initCheckedValue();
      $scope.$apply();
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

function getCheckedItems(arrayFolders, arrayDocs){
  var checkedFolders =[]
  for(var i=0; i<arrayFolders.length; i++){
    if(arrayFolders[i].checked){
      checkedFolders.push(arrayFolders[i])
    }
  }
  var checkedDocuments =[]
  for(var i=0; i<arrayDocs.length; i++){
    if(arrayDocs[i].checked){
      checkedDocuments.push(arrayDocs[i])
    }
  }
  return {
    folders: checkedFolders,
    documents: checkedDocuments
  }
}

function getFilter(nameWorkspaceFolder){
  var filter ="";

  switch(nameWorkspaceFolder){
    case "documents":
      filter="owner";
      break;
      case "trash":
        filter="owner";
        break;
        default:
          filter = nameWorkspaceFolder;
          break;
        }

        return filter;
      }
