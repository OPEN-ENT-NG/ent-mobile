angular.module('ent.pronotes', ['ent.pronotes_service'])

  .controller('ListingUsersCtrl', function ($scope, $rootScope, $window, PronoteService, $ionicPlatform, $sce, $state, $ionicLoading) {

    PronoteService.getAllApps().then(function(resp){
      $scope.pronotes = [];
      if(resp != null)
        for(var i=0  ; i < resp.data.apps.length ; i++){
          if(resp.data.apps[i].name.indexOf("Pronote") > -1){
            $scope.pronotes.push({
              name: resp.data.apps[i].name,
              address: resp.data.apps[i].address
            });
          }
        }
    });

    if($state.current.name == "app.pronote"){
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      var iframe = document.querySelector( "#iframe" );
      var iframeContent = iframe.contentDocument || iframe.contentWindow.document;
      if (  iframeContent.readyState  == 'complete' ) {
        iframe.onload = function(){
            $ionicLoading.hide();
        };
      }
    }

    $scope.showPronote = function(link,namePronote){
      $rootScope.pronoteName = namePronote;
      $rootScope.link = $sce.trustAsResourceUrl(link);
      $state.go("app.pronote");
    }

  });
