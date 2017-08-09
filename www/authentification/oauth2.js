angular.module('ent.oauth2', [])

.service('OAuthService', function(domainENT, $http,OAuth2Params){

  this.doAuthent = function (username, password){
   // getting the token
    var base64Value = btoa(OAuth2Params.clientId.concat(":").concat(OAuth2Params.secret) );
    $http.defaults.headers.post['Authorization'] = 'Basic '.concat(base64Value);
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.post['Accept'] = 'application/json;charset=UTF-8';
    return $http({
      method: "post",
      url: domainENT+"/auth/oauth2/token",
      data: "grant_type=password&username="+username+"&password="+password+"&client_id="+OAuth2Params.clientId+"&client_secret="+OAuth2Params.secret+"&scope=userbook userinfo directory workspace conversation document file"
    }).then(function(result){
       $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.data.access_token;
      return result;
    });
  }

})

.controller('LoginCtrl', function($scope, $state, OAuthService) {
  $scope.doLogin= function(user){
    //login();
    console.log("user: "+user);
    OAuthService.doAuthent(user.username, user.password).then(function(response){
      console.log(response.data);
      $scope.wrongLogin = false;
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('password', response.data.access_token);

      $state.go('app.actualites');
    }, function errorCallback(response) {
       $scope.wrongLogin = true;
       $state.go("login");
    })
  }
})
