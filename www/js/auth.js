angular.module('ent.auth', [])



.controller('LoginCtrl', function($scope, $state) {

  $scope.doLogin = function(user) {
    console.log("login");
    $state.go('app.actualites');
  };

})
