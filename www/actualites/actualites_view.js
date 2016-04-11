angular.module('ent.actualites_view', ['ent.actualites_service', 'angularMoment'])

.controller('ActusCtrl', function ($scope,$ionicPopover, $state, $rootScope, InfosService,$ionicLoading) {

  $scope.statusInfos = InfosService.getStatusInfos();
  $rootScope.selectedStatus =   $scope.statusInfos;
  getActualites();

  $scope.getCountComments = function(info, commentsAreShown){
    if(info.comments != null){
      var text;
      if(commentsAreShown){
        text = $scope.translationActus["actualites.info.label.comments.close"];
      } else {
        text = $scope.translationActus["actualites.info.label.comments"]+" ("+info.comments.length+")";
      }
      return text;
    }
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


  $scope.doRefreshInfos = function() {
    $scope.infos.unshift(getActualites());
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
          thread_id: resp.data[i].thread_id,
          username: resp.data[i].username,
          thread_icon: resp.data[i].thread_icon,
          comments: angular.fromJson(resp.data[i].comments)
        });
      }
    }, function(err){
      alert('ERR:'+ err);
    });
  }
});
