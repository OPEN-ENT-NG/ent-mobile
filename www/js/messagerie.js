angular.module('ent.messagerie', [])

.controller('MessagerieFoldersCtrl', function($scope, $http){
  $http.get("https://recette-leo.entcore.org/conversation/folders/list").then(function(resp){
    $scope.folders = resp.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.setCurrentFolder = function (index){
    localStorage.setItem('messagerie_folder_name',$scope.folders[index].name);
    localStorage.setItem('messagerie_folder_id',$scope.folders[index].id);
  }

  $scope.doRefreshFolders = function() {

    $http.get("https://recette-leo.entcore.org/conversation/folders/list").then(function(resp){
      $scope.folders = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    })
    .finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  // $scope.folders=
  // [
  //   {
  //     name: "cocorico",
  //     id: "21f7dab9-973a-49c1-bb60-2c8b870aadbc"
  //   },
  //   {
  //     name: "# TRAVAIL ]",
  //     id: "34d19db0-f83e-47e7-aae8-1be863247a8e"
  //   },
  //   {
  //     name: "& PERSO &",
  //     id: "ec8124e7-6ab5-4569-abfe-a05b7de3568b"
  //   }
  // ];
})
