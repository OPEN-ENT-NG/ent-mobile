angular.module('ent.oauth2', [])

.service('OAuthService', function(domainENT, $http){

  this.doAuthent = function (username, password){
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    return $http({
      method: "post",
      url: domainENT+"/auth/oauth2/token",
      data: "grant_type=password&username="+username+"&password="+password+"&client_id=appmobile&client_secret=secret"
    });
  }
})

.controller('LoginCtrl', function($scope, $state, OAuthService) {

  // Wait for Cordova to load
     document.addEventListener("deviceready", onDeviceReady, false);

     // Cordova is ready
     function onDeviceReady() {
        if(localStorage.getItem('access_token')){
          $state.go('app.actualites');
          }
     }

  $scope.doLogin= function(user){
    // login();
    console.log("user: "+user);
    OAuthService.doAuthent(user.username, user.password).then(function(response){
      console.log(response.data);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('password', response.data.access_token);

      console.log(localStorage.getItem('access_token'));
      $state.go('app.actualites');

    }, function errorCallback(response) {
      alert('Erreur '+response.status);
    })
  }
})
