angular.module('ent.workspace_trash',['ent.workspace_service'])

.controller('WorkspaceTrashContentCtlr', function($scope, $rootScope, WorkspaceService, $ionicLoading, MimeTypeFactory, $ionicHistory, $ionicPopup, $ionicPopover, $ionicPlatform){

  getData()
  $rootScope.checkable = false

  $scope.isMyDocuments = function (){
    return false
  }

  $scope.isTrash = function (){
    return true
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
    return $rootScope.checkable ? count:$rootScope.translationWorkspace["trash"]
  }

  $scope.deleteSelectedItems = function(){
    var checkedItems = getCheckedItems($scope.folders, $scope.documents)
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.closePopover()
    WorkspaceService.deleteSelectedFolders(checkedItems.folders, false).then(function(res){
      console.log(res);
      WorkspaceService.deleteSelectedDocuments(checkedItems.documents, false).then(function(response){
        console.log(response);
        $rootScope.checkable = false
        getData()
      })
      $ionicLoading.hide()

    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }

  $scope.restoreSelectedItems = function(){
    var checkedItems = getCheckedItems($scope.folders, $scope.documents)
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.closePopover()
    WorkspaceService.restoreSelectedFolders(checkedItems.folders).then(function(res){
      console.log(res);
      WorkspaceService.restoreSelectedDocuments(checkedItems.documents).then(function(response){
        console.log(response);
        $rootScope.checkable = false
        getData()
      })
      $ionicLoading.hide()

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

  var deregisterHardBack= $ionicPlatform.registerBackButtonAction(doCustomBack, 101);
  $scope.$on('$destroy', function() {
    deregisterHardBack();
  });

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });

    WorkspaceService.getTrashFilesContent().then(function(res) {
      $scope.documents=[]
      $scope.folders=[]

      for(var i=0; i< res.data.length; i++){
        if(res.data[i].folder=="Trash" && !res.data[i].hasOwnProperty('old-folder')){
          res.data[i].checked = false
          $scope.documents.push(MimeTypeFactory.setIcons(res.data[i]))
        }
      }
      console.log("files: "+$scope.documents.length)
      console.log($scope.documents)

      getFoldersTrash()
      $ionicLoading.hide()
    },function (err) {
      $ionicLoading.hide()
      $scope.showAlertError()
    })
  }

  function getFoldersTrash(){
    WorkspaceService.getCompleteFoldersByFilter('owner').then(function(result){
      for(var i=0; i<result.data.length; i++){
        if(result.data[i].hasOwnProperty('old-folder')){
          result.data[i].checked = false
          $scope.folders.push(result.data[i]);
        }
      }
      console.log("folders: "+$scope.folders.length)
      console.log($scope.folders)
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }
})
