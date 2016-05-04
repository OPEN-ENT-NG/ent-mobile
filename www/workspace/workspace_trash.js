angular.module('ent.workspace_trash',['ent.workspace_service'])

.controller('WorkspaceTrashContentCtlr', function($scope,WorkspaceService, $ionicLoading, MimeTypeFactory){

  getData();

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.getTrashContent().then(function(res) {
      console.log(res.data)
      $scope.documents=[];
      $scope.folders=[];

      for(var i=0; i< res.data.length; i++){
        if(res.data[i].folder!="Trash"){
          res.data[i].name = res.data[i]["old-folder"];
          $scope.folders.push(  res.data[i])
        } else {
          $scope.documents.push(res.data[i]);
        }
      }
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }
})
