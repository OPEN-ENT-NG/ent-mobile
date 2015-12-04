angular.module('ent.actualites', [])

.controller('InfosCtrl', function ($scope, $http,$ionicPopover, $state) {
  $http.get("https://recette-leo.entcore.org/actualites/infos").then(function(resp){
    $scope.infos = resp.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.goThreads = function(){
    $state.go("app.threads");
  };

  $scope.statusInfos = [
    {nom: "Brouillon", statut: "1"},
    {nom: "Soumises", statut: "2"},
    {nom: "Publiées", statut: "3"}
  ];

  $scope.filter = {};

  $ionicPopover.fromTemplateUrl('templates/popover_actualites.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });

  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $scope.statusFilter = function(fruit) {
       if ($scope.colourIncludes.length > 0) {
           if ($.inArray(fruit.colour, $scope.colourIncludes) < 0)
               return;
       }

       return fruit;
   }
})

.controller('ThreadsCtrl', function ($scope, $http,$ionicPopover) {
  $http.get("https://recette-leo.entcore.org/actualites/threads").then(function(resp){
    $scope.threads = resp.data;
    console.log('success: '+$scope.threads);
  }, function(err){
    alert('ERR:'+ err);
  });
});
