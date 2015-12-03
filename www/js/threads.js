angular.module('ent.threads', [])

.controller('ThreadsCtrl', function ($scope, $http,$ionicPopover) {
  $http.get("https://recette-leo.entcore.org/actualites/threads").then(function(resp){
    $scope.threads = resp.data;
    console.log('success: '+$scope.threads);
  }, function(err){
    alert('ERR:'+ err);
  });
});
