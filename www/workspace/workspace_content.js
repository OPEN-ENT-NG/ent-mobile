angular.module('ent.workspace_content',['ent.workspace_service'])

.controller('WorkspaceFolderContentCtlr', function($scope, $rootScope, $stateParams, $state, WorkspaceService, $ionicLoading, MimeTypeFactory){

  var filter = getFilter($stateParams.nameWorkspaceFolder);
  
  $scope.init = function(){
    getData();
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

  $rootScope.importFile = function(doc){
    var attachment = ele.files[0];
    console.log(attachment);
  }

  $scope.doRefresh = function(){
    getData()
    $scope.$broadcast('scroll.refreshComplete')
    $scope.$apply()
  }

  $scope.getTitle = function(){
    return $rootScope.translationWorkspace[$stateParams.nameWorkspaceFolder]
  }

  function getData(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.getDocumentsByFilter(filter, filter==="owner").then(function(result){
      $scope.documents = []
      for(var i=0; i<result.data.length;i++){
        $scope.documents.push(MimeTypeFactory.setIcons(result.data[i]));
      }
      console.log("files: "+$scope.documents.length);
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
      console.log("folders: "+$scope.folders.length)
    })
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
