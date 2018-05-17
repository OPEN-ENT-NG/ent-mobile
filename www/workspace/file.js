angular.module('ent.workspace_file',['ent.workspace_service'])

.controller('WorkspaceFileCtlr', function($scope, $rootScope, $ionicPopup, domainENT, WorkspaceService, $ionicLoading, $stateParams, $ionicHistory,  $ionicPopover,$state, RenamePopUpFactory, MovingItemsFactory){

  var myUserRights = [] ;
  var isOwner = false ;
  getShareRights();

  console.log($rootScope.doc);
  $rootScope.doc.ownerPhoto = '/userbook/avatar/'+$rootScope.doc.owner

  $scope.downloadDoc = function(){
    var docUrl = domainENT+"/workspace/document/"+$rootScope.doc._id;
    console.log(cordova.plugins.diagnostic);
    cordova.plugins.diagnostic.getPermissionsAuthorizationStatus(function(statuses){
      console.log(statuses);
      $scope.downloadFile($rootScope.doc.name, docUrl, $rootScope.doc.metadata['content-type'], "workspace");
    },function(error){
      console.log(error);
    },cordova.plugins.diagnostic.runtimePermissionGroups.STORAGE);
  }

  $scope.goShare = function(){
    if($scope.isRightToShare()){
      $state.go('app.workspace_share', {idItems:$rootScope.doc._id})
    }
  }

  $scope.commentDoc = function (){

    $scope.data = {};

    if($scope.isRightToComment()){

      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.comment">',
        title: $rootScope.translationWorkspace["workspace.comment"],
        scope: $scope,
        buttons: [
          { text: $rootScope.translationWorkspace["cancel"] },
          {
            text: '<b>'+$rootScope.translationWorkspace["workspace.comment"]+'</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.comment) {
                e.preventDefault();
              } else {
                return $scope.data.comment;
              }
            }
          }
        ]
      });

      myPopup.then(function(res) {
        if(res){
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>'
          });
          WorkspaceService.commentDocById($rootScope.doc._id, res).then(function(result){
            updateDoc($rootScope.doc)
            $ionicLoading.hide()
          }, function(err){
            $ionicLoading.hide()
            $scope.showAlertError()
          });
        }
      })
    }
  }

  $scope.renameDoc = function (){
    RenamePopUpFactory.getPopup($scope, $rootScope.doc).then(function(res) {
      console.log(res);
      if(res){
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        WorkspaceService.renameDoc($rootScope.doc._id, res).then(function(result){
          updateDoc($rootScope.doc)
          $ionicLoading.hide()
        }, function(err){
          $ionicLoading.hide()
          $scope.showAlertError()
        });
      }
    })
  }

  $scope.trashDoc = function(doc){
    $scope.getConfirmPopup($rootScope.translationWorkspace["workspace.delete"], $rootScope.translationWorkspace["confirm.remove"], $rootScope.translationWorkspace["cancel"], $rootScope.translationWorkspace["confirm"]).then(function(res){

      if(res){
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        WorkspaceService.trashDoc($rootScope.doc._id).then(function(){
          $ionicLoading.hide();
          $ionicHistory.clearCache();
          $ionicHistory.goBack();
        }, function(err){
          $ionicLoading.hide();
          $scope.showAlertError();
        });
      }
    })
  }

  $scope.moveDoc = function () {
    MovingItemsFactory.setMovingDocs([$rootScope.doc])
    MovingItemsFactory.setMovingFolders([])
    $state.go('app.workspace_tree', {action:'move'})
  }

  $scope.copyDoc = function(){
    MovingItemsFactory.setMovingDocs([$rootScope.doc])
    MovingItemsFactory.setMovingFolders([])
    $state.go('app.workspace_tree', {action:'copy'})
  }

  $scope.goVersion = function(){
    $scope.closePopover()
    $state.go("app.workspace_file_versions")
  }

  $scope.isDocImage = function(metadata)
  {
    if (metadata == 0 || metadata == undefined) {
      return 'false';
    }
    if (metadata['content-type'].indexOf("image") != -1) {
      return 'true';
    }
    return 'false';
  }

  $scope.getCountComments = function(doc, commentsAreShown){
    if(doc.comments != null){
      var text
      if(commentsAreShown){
        text = $rootScope.translationWorkspace["workspace.document.comment.hide"]
      } else {
        text = $rootScope.translationWorkspace["workspace.document.comment.show"]+" ("+$rootScope.doc.comments.length+")";
      }
      return text;
    }
  }

  $scope.toggleComments = function(doc) {
    if ($scope.areCommentsShown(doc)) {
      $scope.shownComments = null;
    } else {
      $scope.shownComments = doc;
    }
  };

  $scope.areCommentsShown = function(doc) {
    return $scope.shownComments === doc;
  };

  $scope.isRightToUpdate = function(){
    if(isOwner){
      return true ;
    }else{
      for(var i = 0 ; i < myUserRights.length ; i++){
        if(myUserRights[i]['org-entcore-workspace-service-WorkspaceService|updateDocument']){
          return true ;
        }
      }
    }
    return false ;
  }

  $scope.isRightToDelete = function(){
    if(isOwner){
      return true ;
    }else{
      for(var i = 0 ; i < myUserRights.length ; i++){
        if(myUserRights[i]['org-entcore-workspace-service-WorkspaceService|moveTrash']){
          return true ;
        }
      }
    }
    return false ;
  }

  $scope.isRightToMove = function(){
    var isRight = false ;
    if(isOwner){
      return true ;
    }else{
      for(var i = 0 ; i < myUserRights.length ; i++){
        if(myUserRights[i]['org-entcore-workspace-service-WorkspaceService|moveDocuments']){
          return true ;
        }
      }
    }
    return false ;
  }

  $scope.isRightToShare = function(){
    var isRight = false ;
    if(isOwner){
      return true ;
    }else{
      for(var i = 0 ; i < myUserRights.length ; i++){
        if(myUserRights[i]['org-entcore-workspace-service-WorkspaceService|shareJson']){
          return true ;
        }
      }
    }
    return false ;
  }

  $scope.isRightToComment = function(){
    var isRight = false ;
    if(isOwner){
      return true ;
    }else{
      for(var i = 0 ; i < myUserRights.length ; i++){
        if(myUserRights[i]['org-entcore-workspace-service-WorkspaceService|commentDocument']
            || myUserRights[i]['org-entcore-workspace-service-WorkspaceService|commentFolder']){
          return true ;
        }
      }
    }
    return false ;
  }

  $ionicPopover.fromTemplateUrl('workspace/popover-file.html', {
    scope: $scope
  }).then(function(popover) {
    $rootScope.popover = popover;
  });

  function updateDoc(doc){
    console.log($stateParams.filtre);
    WorkspaceService.getDocumentsByFilter($stateParams.filtre,false).then(function(res){
      for(var i=0; i< res.data.length; i++){
        if(res.data[i]._id == doc._id){
          $rootScope.doc = res.data[i]
          $rootScope.doc.test = doc.test;
        }
      }
    })
  }

  function getShareRights(){
    if($rootScope.doc.owner == $rootScope.myUser.userId){
      isOwner = true ;
    }else{
      for(var i = 0 ; i < $rootScope.doc.shared.length ; i++){
        if($rootScope.doc.shared[i].userId == $rootScope.myUser.userId ||
          $rootScope.myUser.groupsIds.some(function (id) {
          return id == $rootScope.doc.shared[i]['groupId'];
        })){
          myUserRights.push($rootScope.doc.shared[i]);
          break;
        }
      }
    }
  }

})
