angular.module('ent.workspace',['ent.workspace_service', 'ent.workspace_trash'])

.controller('WorkspaceFolderContentCtlr', function($scope, $stateParams, WorkspaceService, $ionicLoading, MimeTypeFactory){

  $scope.nameWorkspaceFolder = $stateParams.nameWorkspaceFolder;
  $scope.filter = getFilter($stateParams.nameWorkspaceFolder);
  console.log($scope.filter);

  getData();

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.getDocumentsByFilter($scope.filter).then(function(result){
      $scope.documents = []
      for(var i=0; i<result.data.length;i++){
        $scope.documents.push(setIcons(result.data[i]));
      }
      console.log($scope.documents);
      if($scope.filter!="appDocuments"){
        getFolders($scope.filter)
      }
      $ionicLoading.hide()
    }, function(err){
      $ionicLoading.hide()
      $scope.showAlertError()
    });
  }

  function getDocuments(filter){
    WorkspaceService.getDocumentsByFilter(filter).then(function(result){
      $scope.documents = []
      for(var i=0; i<result.data.length;i++){
        $scope.documents.push(setIcons(result.data[i]));
      }
      console.log($scope.documents);
    })
  }

  function getFolders(filter){
    WorkspaceService.getFoldersByFilter(filter).then(function(res){
      $scope.folders = res.data
      console.log($scope.folders)
    })
  }

  function setIcons(doc){
    if(doc.hasOwnProperty('thumbnails')){
      doc.icon_image = "/workspace/document/"+doc._id+"?thumbnail=120x120";
    }
    doc.icon_class = MimeTypeFactory.getThumbnailByMimeType(doc.metadata["content-type"]);
    return doc;
  }
})




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
