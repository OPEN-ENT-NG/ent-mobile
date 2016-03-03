angular.module('ent.actualites', ['ent.actualites_service'])

.controller('InfosCtrl', function ($scope,$ionicPopover, $state, $rootScope, InfosService,$ionicLoading) {
  $scope.statusInfos = InfosService.getStatusInfos();
  getActualites();
  getThreads();
  getTranslation();

  $scope.getCountComments = function(info){
    if(info.comments != null){
      var size = info.comments.length;
      var unite = size ==1 ? "Commentaire":"Commentaires";
      return size+" "+unite;
    }
  }

  // $scope.getTitleWithStatus = function (info){
  //   var status = "";
  //   if(info.status!=3){
  //     var tmp = "actualites.edition.status.";
  //     status = " "+$scope.translationActus[tmp+info.status];
  //   }
  //   return info.title+status;
  // }

  $scope.getStatusByInfo = function (status){
      return $scope.translationActus["actualites.edition.status."+status];
  }
  /*
  * if given group is the selected group, deselect it
  * else, select the given group
  */
  $scope.toggleComments = function(info) {
    console.log(info.comments);
    if ($scope.areCommentsShown(info)) {
      $scope.shownComments = null;
    } else {
      $scope.shownComments = info;
    }
  };

  $scope.areCommentsShown = function(info) {
    return $scope.shownComments === info;
  };

  $scope.goThreads = function(){
    $state.go("app.threads");
  };

  $rootScope.filterInfos = [];
  $scope.filterByStatus = function (state) {
    return $rootScope.filterInfos[state.status] | noFilter($rootScope.filterInfos);
  };

  $rootScope.filterThreads = [];
  $scope.filterByThread = function (thread) {
    return $rootScope.filterThreads[thread.thread_id]| noFilter($rootScope.filterThreads);
  };

  function noFilter(filterObj) {
    for (var key in filterObj) {
      if (filterObj[key]) {
        return false;
      }
    }
    return true;
  }

  $scope.doRefreshInfos = function() {
    $scope.infos.unshift(getActualites());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  $scope.doRefreshThreads = function() {
    $scope.threads.unshift(getThreads());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  $ionicPopover.fromTemplateUrl('actualites/popover_actualites.html', {
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

  function getActualites(){
    $scope.infos =[];
    InfosService.getAllInfos().then(function (resp) {
      for(var i = 0; i< resp.data.length; i++){
        $scope.infos.push({
          _id: resp.data[i]._id,
          title: resp.data[i].title,
          content: resp.data[i].content,
          status: resp.data[i].status,
          publication_date: resp.data[i].publication_date,
          modified: resp.data[i].modified,
          thread_id: resp.data[i].thread_id,
          username: resp.data[i].username,
          thread_icon: $scope.setCorrectImage(resp.data[i].thread_icon,"/../../img/illustrations/actualites-default.png"),
          comments: angular.fromJson(resp.data[i].comments)
        });
      }
      console.log($scope.actualites);
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  function getThreads(){
    $scope.threads = [];
    InfosService.getAllThreads().then(function(resp){
      for(var i = 0; i< resp.data.length; i++){
        $scope.threads.push({
          thread_id: resp.data[i]._id,
          title: resp.data[i].title,
          thread_icon: $scope.setCorrectImage(resp.data[i].icon, "/../../img/illustrations/actualites-default.png")
        });
      }
    }, function(err){
      alert('ERR:'+ err);
    });
  }

  function getTranslation(){
    InfosService.getTranslation().then(function(resp){
        $rootScope.translationActus = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    });
  }
});
