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
    {nom: "Brouillons", etat: 1},
    {nom: "Soumises", etat: 2},
    {nom: "Publiées", etat: 3}
  ];

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
    $window.location.reload(true)
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

.filter('statusSelected', function($filter){
  return function(statusInfos){

    var i, len;

    // get customers that have been checked
    var checkedStatus = $filter('filter')(statusInfos, {checked: true});

    // Add in a check to see if any customers were selected. If none, return
    // them all without filters
    if(checkedStatus.length == 0) {
      return statusInfos;
    }

    // get all the unique cities that come from these checked customers
    var allStatus = {};
    for(i = 0, len = checkedStatus.length; i < len; ++i) {
      // if this checked customers cities isn't already in the cities object
      // add it
      if(!allStatus.hasOwnProperty(checkedStatus[i].etat)) {
        allStatus[checkedStatus[i].etat] = true;
      }
    }

    var ret = [];
    for(i = 0, len = statusInfos.length; i < len; ++i) {
      // If this customer's city exists in the cities object, add it to the
      // return array
      if(allStatus[checkedStatus[i].etat]) {
        ret.push(statusInfos[i]);
      }
    }
    // we have our result!
    return ret;
  };
})

.controller('ThreadsCtrl', function ($scope, $http,$ionicPopover) {
  $http.get("https://recette-leo.entcore.org/actualites/threads").then(function(resp){
    $scope.threads = resp.data;
    console.log('success: '+$scope.threads);
  }, function(err){
    alert('ERR:'+ err);
  });
});
