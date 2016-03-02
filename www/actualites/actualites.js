
angular.module('ent.actualites', ['ent.actualites_service', 'ent.actualites_view','ent.threads', 'angularMoment'])


.controller('FilterActusCtrl', function($rootScope, InfosService){

  getTranslation();

  $rootScope.filterInfos = InfosService.getAllInfos();
  console.log("filterInfos");
  console.log($rootScope.filterInfos);
  $rootScope.filterByStatus = function (state) {
    return $rootScope.filterInfos[state.status];
  };

  $rootScope.filterThreads = [];
  $rootScope.filterByThread = function (thread) {
    return $rootScope.filterThreads[thread.thread_id]| noFilter($rootScope.filterThreads);
  };

  // toggle selection for a given fruit by name
  $rootScope.toggleStatus = function toggleStatus(state) {
    var idx = $rootScope.selectedStatus.indexOf(state);
    // is currently selected
    if (idx > -1) {
      $rootScope.selectedStatus.splice(idx, 1);
    }
    // is newly selected
    else {
      $rootScope.selectedStatus.push(state);
    }
  };

  function getTranslation(){
    InfosService.getTranslation().then(function(response){
      $rootScope.translationActus = angular.fromJson(response.data);

    }, function(err){
      alert('ERR:'+ err);
    })
  }
})
