angular.module('ent.actualites', [])

.controller('InfosCtrl', function ($scope, $http,$ionicPopover, $state, $rootScope) {

  $http.get("https://recette-leo.entcore.org/actualites/infos").then(function(resp){
    $scope.infos = [];
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

  // $scope.infos = [
  //   {
  //     title: "Règlement restauration scolaire",
  //     content: "<p class=\"ng-scope\">Bonjour &agrave; tous,&nbsp;</p><p class=\"ng-scope\">La nouvelle version du r&egrave;glement du restaurant scolaire est disponible dans mon espace document.&nbsp;</p><p class=\"ng-scope\">Bonne lecture&nbsp;</p><p class=\"ng-scope\">Lien <a href=\"/workspace/document/ec41e759-3def-48ad-a787-43347eb49d72\" data-app-prefix=\"workspace\" data-id=\"ec41e759-3def-48ad-a787-43347eb49d72\">ici</a>​​</p>","publication_date": "2015-07-28T07:47:23.004",
  //     username: "Aurélie DROUILLAC",
  //     comments:  "[{\"_id\":111,\"comment\":\"je ne reçois pas le lien !\",\"owner\":\"91d042ed-b4d5-4dc8-bd97-fb0360c01f2b\",\"created\":\"2015-07-28T09:54:51.820784\",\"modified\":\"2015-07-28T09:54:51.820784\",\"username\":\"VINCENT CAILLET\"}, \n {\"_id\":112,\"comment\":\"petit problème technique!\",\"owner\":\"8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba\",\"created\":\"2015-07-28T09:58:01.269638\",\"modified\":\"2015-07-28T09:58:01.269638\",\"username\":\"Aurélie DROUILLAC\"}]",
  //     status: 1,
  //     thread_id: 10
  //   },
  //   {
  //     title: "Test",
  //     content: "<p class=\"ng-scope\">test</p><p class=\"ng-scope\"><a target=\"_blank\" href=\"/workspace/document/95b4b7c9-9eff-4ee9-9892-e6cdcbae83dd?thumbnail=1115x0\"><img src=\"/workspace/document/95b4b7c9-9eff-4ee9-9892-e6cdcbae83dd?thumbnail=1115x0\" /></a></p>",
  //     "publication_date": "2015-12-28T07:47:23.004",
  //     username: "STEPHANE NABARRA",
  //     comments:  null,
  //     status: 2,
  //     thread_id: 27
  //   },
  //   {
  //     title: "Google",
  //     content: "<p class=\"ng-scope\">Lien <a href=\"http://www.google.fr\">ici</a>​​</p>",
  //     "publication_date": "2015-12-28T07:47:23.004",
  //     username: "STEPHANE NABARRA",
  //     comments:  null,
  //     status: 2,
  //     thread_id: 27
  //   }
  //]

  $scope.getCountComments = function(info){
    var size = info.comments.length;
    var unite = size ==1 ? "Commentaire":"Commentaires";
    return size+" "+unite;
  }

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


  // $scope.threads = [
  //   {title: "Brouillons", thread_id: 10},
  //   {title: "Soumises", thread_id: 27},
  //   {title: "Publiées", thread_id: 31}
  // ];
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

  $scope.doRefresh = function() {

    $http.get("https://recette-leo.entcore.org/actualites/infos").then(function(resp){
      $scope.infos = [];
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
    })
    .finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });

    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  };

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
});
