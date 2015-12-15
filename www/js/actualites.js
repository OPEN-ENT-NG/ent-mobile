angular.module('ent.actualites', [])

.controller('InfosCtrl', function ($scope, $http,$ionicPopover, $state) {
  $scope.infos = [];

  // $http.get("https://recette-leo.entcore.org/actualites/infos")
  // .then(function(resp){
  //   $scope.infos = resp.data;
  // }, function(err){
  //   alert('ERR:'+ err);
  // });

  $scope.infos = [
    {
      title: "Règlement restauration scolaire",
      content: "<p class=\"ng-scope\">Bonjour &agrave; tous,&nbsp;</p><p class=\"ng-scope\">La nouvelle version du r&egrave;glement du restaurant scolaire est disponible dans mon espace document.&nbsp;</p><p class=\"ng-scope\">Bonne lecture&nbsp;</p><p class=\"ng-scope\">Lien <a href=\"/workspace/document/ec41e759-3def-48ad-a787-43347eb49d72\" data-app-prefix=\"workspace\" data-id=\"ec41e759-3def-48ad-a787-43347eb49d72\">ici</a>​​</p>","publication_date": "2015-07-28T07:47:23.004",
      username: "Aurélie DROUILLAC",
      comments: [
                  { _id:111,
                   comment:"je ne reçois pas le lien!",
                   owner:"91d042ed-b4d5-4dc8-bd97-fb0360c01f2b",
                   created:"2015-07-28T09:54:51.820784",
                   modified:"2015-07-28T09:54:51.820784",
                   username:"VINCENT CAILLET"
                 },
                 {
                   _id:112,
                   comment:"petit problème technique!",
                   owner:"8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
                   created:"2015-07-28T09:58:01.269638",
                   modified:"2015-07-28T09:58:01.269638",
                   username:"Aurélie DROUILLAC"
                 }
              ]
    }]

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

      $scope.getComments = function (info) {
        return $scope.info.comments;
      }

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
