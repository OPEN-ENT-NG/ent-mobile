angular.module('ent.workspace_file_versions',['ent.workspace_service'])

.controller('FileVersionCtrl', function($scope, $rootScope, WorkspaceService,$ionicLoading, domainENT){

  getData($rootScope.doc._id)

  $scope.downloadVersion = function(version){
    $scope.getConfirmPopup('Télécharger', 'Voulez-vous télécharger cette version de ce fichier ?', $rootScope.translationWorkspace["cancel"], 'OK' ).then(function(res){
      console.log(res);
      if(res){
        var versionUrl = domainENT+"/workspace/document/"+$rootScope.doc._id+"/revision/"+version._id;
        $scope.downloadFile(version.filename, versionUrl,version.metadata["content-type"]);
      }
    })
  }

  $scope.deleteVersion = function(idVersion){
    $scope.getConfirmPopup($rootScope.translationWorkspace["workspace.delete.version"], 'Êtes-vous sûr(e) de vouloir supprimer cette version de ce fichier ?', $rootScope.translationWorkspace["cancel"], 'OK' ).then(function(res){
      console.log(res);
      if(res){
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
    })
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
