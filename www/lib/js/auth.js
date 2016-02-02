angular.module('ent.auth', [])



.controller('LoginCtrl', function($scope, $state, $http, domainENT) {

  $scope.doLogin = function(user, $scope, $http) {
    console.log("login");
    $http.get(domainENT+'/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=mobile-ong&redirect_uri=localhost').then(function(resp) {
       console.log('Success', resp);
       // For JSON responses, resp.data contains the result
     }, function(err) {
       console.error('ERR', err);
       // err.status will contain the status code
     })
    //$state.go('app.actualites');
  };
})
