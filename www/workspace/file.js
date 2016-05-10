angular.module('ent.workspace_file',['ent.workspace_service'])

.controller('WorkspaceFileCtlr', function($scope, $rootScope){
  console.log($rootScope.doc);

  $rootScope.doc.ownerPhoto = '/userbook/avatar/'+$rootScope.doc.owner

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
})
