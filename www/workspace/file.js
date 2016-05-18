angular.module('ent.workspace_file',['ent.workspace_service'])

.controller('WorkspaceFileCtlr', function($scope, $rootScope, $ionicPopup, domainENT, WorkspaceService, $ionicLoading, $stateParams, DeleteDocPopupFactory, $ionicHistory){
  console.log($rootScope.doc);
  $rootScope.doc.ownerPhoto = '/userbook/avatar/'+$rootScope.doc.owner

  $scope.downloadDoc = function(){
    var docUrl = domainENT+"/workspace/document/"+$rootScope.doc._id;
    $scope.downloadFile($rootScope.doc.name, docUrl,$rootScope.doc.metadata['content-type'], "workspace");
  }

  $scope.commentDoc = function (){
    $scope.data = {};

    // An elaborate, custom popup
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
    })
  }

  $scope.renameDoc = function (){
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="doc.name">',
      title: $rootScope.translationWorkspace["workspace.rename"],
      scope: $scope,
      buttons: [
        { text: $rootScope.translationWorkspace["cancel"] },
        {
          text: '<b>'+$rootScope.translationWorkspace["workspace.rename"]+'</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.doc.name) {
              e.preventDefault();
            } else {
              return $scope.doc.name;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
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
    var popupMove = DeleteDocPopupFactory.getPopup($scope);
    popupMove.then(function(res){

      if(res!=null){
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        WorkspaceService.trashDoc($rootScope.doc._id).then(function(){
          $ionicLoading.hide();
          $ionicHistory.clearCache();
          $ionicHistory.goBack();
          //back
        }, function(err){
          $ionicLoading.hide();
          $scope.showAlertError();
        });
      }
    })
  }

  $scope.versions = function(){
    
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

  function updateDoc(doc){
    console.log($stateParams.filtre);
    WorkspaceService.getDocumentsByFilter($stateParams.filtre,false).then(function(res){
      for(var i=0; i< res.data.length; i++){
        if(res.data[i]._id == doc._id){
          $rootScope.doc = res.data[i]
        }
      }
    })
  }
})
