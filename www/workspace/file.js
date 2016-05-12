angular.module('ent.workspace_file',['ent.workspace_service'])

.controller('WorkspaceFileCtlr', function($scope, $rootScope, $ionicPopover, domainENT, WorkspaceService, $ionicLoading, $stateParams){
  console.log($rootScope.doc);
  $rootScope.doc.ownerPhoto = '/userbook/avatar/'+$rootScope.doc.owner

  $scope.downloadDoc = function(doc){
    console.log(doc);
    var docUrl = domainENT+"/workspace/document/"+doc._id;
    $scope.downloadFile(doc.name, docUrl,doc.metadata['content-type'], "workspace");
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
      console.log('Tapped!', res);
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
