angular.module('ent.messagerie', [])

.controller('MessagerieFoldersCtrl', function($scope, $http){

  $http.get("https://recette-leo.entcore.org/conversation/folders/list").then(function(resp){
    $scope.folders = resp.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.doRefreshFolders = function() {

    $http.get("https://recette-leo.entcore.org/actualites/infos").then(function(resp){
      $scope.folders = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    })
    .finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
})
