angular.module('ent.workspace',['ent.workspace_service'])

.controller('WorkspaceFolderContentCtlr', function($scope, $stateParams, WorkspaceService, $ionicLoading){

  // $scope.nameWorkspaceFolder = $stateParams.nameWorkspaceFolder;
  $scope.nameWorkspaceFolder = "documents";

  $scope.filter = getFilter($stateParams.nameWorkspaceFolder);
  console.log($scope.filter);

  getData();


  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.getFoldersByFilter($scope.filter).then(function(res) {
      $scope.folders = []
      $scope.trashFolders = []
      console.log(res);
      for(var i=0; i<res.data.length;i++){
        if((res.data[i].folder).startsWith("Trash_")){
          $scope.trashFolders.push(res.data[i]);
        } else {
          $scope.folders.push(res.data[i]);
        }
      }
      WorkspaceService.getDocumentsByFilter($scope.filter).then(function(result){
        console.log(result);
        $scope.documents = []
        $scope.trashDocuments = []
        if(res.data[i].folder.startsWith("Trash_") || angular.equals(res.data[i].folder,"Trash")){
          $scope.trashDocuments.push(res.data[i]);
        } else {
          $scope.documents.push(res.data[i]);
        }
      })
      $ionicLoading.hide();
    }, function(err){
      $ionicLoading.hide();
      $scope.showAlertError();
    });
  }


})


function getFilter(nameWorkspaceFolder){
  var filter ="";

  switch($stateParams.nameWorkspaceFolder){
    case "document":
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
