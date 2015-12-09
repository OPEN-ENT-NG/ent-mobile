angular.module('ent.actualites', [])

.controller('InfosCtrl', function ($scope, $http,$ionicPopover, $state) {
  $http.get("https://recette-leo.entcore.org/actualites/infos").then(function(resp){
    $scope.infos = resp.data;
    alert('appel');
  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.goThreads = function(){
    $state.go("app.threads");
  };

  $scope.statusInfos = [
    {nom: "Brouillons", status: 1},
    {nom: "Soumises", status: 2},
    {nom: "Publiées", status: 3}
  ];


  $scope.filter = {};

  $scope.filterByStatus = function (state) {
    return $scope.filter[state.status] || noFilter($scope.filter);
  };

  function noFilter(filterObj) {
    for (var key in filterObj) {
      if (filterObj[key]) {
        return false;
      }
    }
    return true;
  }

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
})

.controller('ThreadsCtrl', function ($scope, $http,$ionicPopover) {
  $http.get("https://recette-leo.entcore.org/actualites/threads").then(function(resp){
    $scope.threads = resp.data;
    console.log('success: '+$scope.threads);
  }, function(err){
    alert('ERR:'+ err);
  });
});
