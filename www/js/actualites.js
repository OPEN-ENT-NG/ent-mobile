angular.module('ent.actualites', [])

.controller('InfosCtrl', function ($scope, $http,$ionicPopover, $state) {
  $scope.infos = [];

  $http.get("https://recette-leo.entcore.org/actualites/infos")
  .then(function(resp){
    $scope.infos = resp.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $http.get("https://recette-leo.entcore.org/actualites/threads").then(function(resp){
    $scope.threads = [];
    for(var i = 0; i< resp.data.length; i++){
      $scope.threads.push({
        thread_id: resp.data[i]._id,
        title: resp.data[i].title,
        thread_icon: resp.data[i].icon
      });
    }
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

  $scope.filterInfos = [];

  $scope.filterByStatus = function (state) {
    return $scope.filterInfos[state.status] || noFilter($scope.filterInfos);
  };

  $scope.filterThreads = [];

  $scope.filterByThread = function (thread) {
    return $scope.filterThreads[thread.thread_id]  || noFilter($scope.filterThreads);
  };

  function noFilter(filterObj) {
    for (var key in filterObj) {
      if (filterObj[key]) {
        return false;
      }
    }
    return true;
  }

  $scope.countComments = function (info) {
    return info.comments.length;
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
  })


  $scope.useThreads = [];

  $scope.filterMakes = function () {
    return function (p) {
      for (var i in $scope.useThreads) {
        if (p._id == $scope.group[i] && $scope.useThreads[i]) {
          return true;
        }
      }
    };
  };
});
