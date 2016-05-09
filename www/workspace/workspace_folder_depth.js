angular.module('ent.workspace',['ent.workspace_service'])

.controller('WorkspaceFolderDepthContentCtlr', function($scope, $rootScope,$stateParams, WorkspaceService, $ionicLoading, MimeTypeFactory){

  $scope.nameFolder = $stateParams.nameFolder
  $scope.filter = $stateParams.filter

  console.log($stateParams.nameFolder)
  console.log($stateParams.filter)

  // getData();

  $scope.doRefresh = function(){
    getData()
    $scope.$broadcast('scroll.refreshComplete')
    $scope.$apply()
  }

  $scope.getTitle = function(){
    return  $scope.nameFolder
  }

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    })
    $scope.documents = []
    $scope.folders = []
    // WorkspaceService.getDocumentsByFilter($scope.filter).then(function(result){
    //   for(var i=0; i<result.data.length;i++){
    //     $scope.documents.push(MimeTypeFactory.setIcons(result.data[i]));
    //   }
    //   console.log("files: "+$scope.documents.length);
    //   if($scope.filter!="appDocuments"){
    //     getFolders($scope.filter)
    //   }
    $ionicLoading.hide()
    // }, function(err){
    //   $ionicLoading.hide()
    //   $scope.showAlertError()
    // });
  }
})
