angular.module('ent.oauth2', [])

.service('OAuthService', function(domainENT, $http,OAuth2Params){

    this.doAuthent = function (username, password) {
      // getting the token
      var base64Value = btoa(OAuth2Params.clientId.concat(":").concat(OAuth2Params.secret));
      var options = {
        headers: {
          'Authorization': 'Basic '.concat(base64Value),
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json;charset=UTF-8'
        }
      };
      var url = domainENT + "/auth/oauth2/token";
      var data = "grant_type=password&username=" + username + "&password=" + password + "&client_id="
        + OAuth2Params.clientId + "&client_secret=" + OAuth2Params.secret
        + "&scope=userbook userinfo directory workspace conversation document blog actualites avatar";
      return $http.post(url, data, options).then(function (result) {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.data.access_token;
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        $http.defaults.headers.common['Accept'] = 'application/json;charset=UTF-8';
        $http.defaults.headers.post['Authorization'] = 'Bearer ' + result.data.access_token;
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        $http.defaults.headers.post['Accept'] = 'application/json;charset=UTF-8';
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
