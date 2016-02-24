angular.module('ent.threads', ['ent.actualites_service'])


.controller('ThreadsCtlr', function($rootScope, $scope, InfosService){

  getThreads();
  
  $scope.doRefreshThreads = function() {
    $scope.threads.unshift(getThreads());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getThreads(){
  $scope.threads = [];
  InfosService.getAllThreads().then(function(resp){
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
}
})
