angular.module('ent.workspace_trash',['ent.workspace_service'])

.controller('WorkspaceTrashContentCtlr', function($scope, $rootScope, WorkspaceService, $ionicLoading, MimeTypeFactory){

  getData();

  $scope.doRefresh = function(){
    getData()
    $scope.$broadcast('scroll.refreshComplete')
    $scope.$apply()
  }

  $scope.getTitle = function(){
    return $rootScope.translationWorkspace["trash"]
  }

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });

    WorkspaceService.getTrashFilesContent().then(function(res) {
      $scope.documents=[]
      $scope.folders=[]

      for(var i=0; i< res.data.length; i++){
        if(res.data[i].folder=="Trash" && !res.data[i].hasOwnProperty('old-folder')){
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
