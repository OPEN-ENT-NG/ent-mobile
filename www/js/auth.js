angular.module('ent.auth', [])



.controller('LoginCtrl', function($scope, $state) {

  $scope.doLogin = function(user) {
    $state.go('app.playlists');
  };

})
