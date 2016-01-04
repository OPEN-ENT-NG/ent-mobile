angular.module('ent.messagerie', [])

.controller('MessagerieFoldersCtrl', function($scope, $http, $state){
  $http.get("https://recette-leo.entcore.org/conversation/folders/list").then(function(resp){
    $scope.folders = resp.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.goToInbox = function(){
    $state.go("app.inbox");
  }
})
