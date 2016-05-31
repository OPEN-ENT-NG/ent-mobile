angular.module('ent.workspace_content',['ent.workspace_service',])

.controller('WorkspaceFolderContentCtlr', function($scope, $rootScope, $stateParams, $state, WorkspaceService, $ionicLoading, MimeTypeFactory, $cordovaProgress, CreateNewFolderPopUpFactory, $ionicPopup){

  var filter = getFilter($stateParams.nameWorkspaceFolder);

  $scope.init = function(){
    getData();
  }

  $rootScope.isMyDocuments = function(){
    return $stateParams.nameWorkspaceFolder == "documents"
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

  $scope.addDocument = function(ele){
    var newDoc = ele.files[0];
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
