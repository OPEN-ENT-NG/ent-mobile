<<<<<<< HEAD
angular.module('ent.actualites', ['ent.actualites_service'])
=======

angular.module('ent.actualites', ['ent.actualites_service', 'ent.actualites_view','ent.threads', 'angularMoment'])
>>>>>>> 0e88c3d2e38315404f80723ee46721b617eb26c4

.controller('InfosCtrl', function ($scope,$ionicPopover, $state, $rootScope, InfosService,$ionicLoading) {

  $ionicLoading.show({
    template: '<i class="spinnericon- "></i>'
  });

  getActualites();
  getThreads();
  getTranslation();

  $ionicLoading.hide();

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

  function getActualites(){
    $scope.infos =[];
    InfosService.getAllInfos().then(function (resp) {
      for(var i = 0; i< resp.data.length; i++){
        if(resp.data[i].status == 3){
          $scope.infos.push({
            _id: resp.data[i]._id,
            title: resp.data[i].title,
            content: resp.data[i].content,
            publication_date: resp.data[i].publication_date,
            modified: resp.data[i].modified,
            thread_id: resp.data[i].thread_id,
            username: resp.data[i].username,
            thread_icon: $scope.setCorrectImage(resp.data[i].thread_icon,"/../../img/illustrations/actualites-default.png"),
            comments: angular.fromJson(resp.data[i].comments)

          });
        }
      }

    }, function(err){
      $scope.showAlertError(err);
    });
  }
})

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
    $scope.showAlertError(err);
  });
}

function getTranslation(){
  InfosService.getTranslation().then(function(resp){
    $rootScope.translationActus = resp.data;
  }, function(err){
    $scope.showAlertError(err);
  });
}
return true;
}
