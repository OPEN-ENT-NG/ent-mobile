angular.module('ent.pronotes', ['ent.pronotes_service'])

  .controller('ListingUsersCtrl', function ($scope, $rootScope, $window, PronoteService ) {

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

    $scope.openPronote = function(link){
      try {
        window.open(link, '_system', 'location=no');
      } catch (e) {
        alert("Popup window blocked " + e.number);
      }
    }
  });
