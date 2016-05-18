angular.module('ent.workspace_file_versions',['ent.workspace_service'])

.controller('FileVersionCtrl', function($scope, $rootScope, WorkspaceService,$ionicLoading){

  getData($rootScope.doc._id)

  $scope.downloadVersion = function(version){
    $scope.getConfirmPopup('Télécharger', 'Voulez-vous télécharger cette version de ce fichier ?').then(function(res){
      console.log(res);
      if(res){

          // $scope.downloadAttachment = function (id){
          //   var attachmentUrl = domainENT+"/conversation/message/"+$scope.email.id+"/attachment/"+id;
          //   var attachment = findElementById($scope.email.attachments, id);
          //   $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType);
          // }
      }
    })
  }

  $scope.deleteVersion = function(idVersion){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.deleteVersion($rootScope.doc._id, idVersion).then(function(result){
      console.log(result.data);
      getData($rootScope.doc._id)
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }

  function getData(fileId){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.versionDoc(fileId).then(function(result){
      $scope.versions = result.data
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }
})
