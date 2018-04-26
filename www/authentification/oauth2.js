angular.module('ent.oauth2', [])

.service('OAuthService', function(domainENT, $http,OAuth2Params){

    console.log(OAuth2Params);
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
        console.log(result);
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + result.data.access_token;
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        $http.defaults.headers.common['Accept'] = 'application/json;charset=UTF-8';
        $http.defaults.headers.post['Authorization'] = 'Bearer ' + result.data.access_token;
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        $http.defaults.headers.post['Accept'] = 'application/json;charset=UTF-8';
        return result;
      });
    }

    this.doRefresh = function (refreshToken)
    {
      var base64Value = btoa(OAuth2Params.clientId.concat(":").concat(OAuth2Params.secret));
      var options = {
        headers: {
          'Authorization': 'Basic '.concat(base64Value),
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json;charset=UTF-8'
        }
      };
      var url = domainENT + "/auth/oauth2/token";
      var data = "grant_type=refresh_token&refresh_token=" + refreshToken + "&client_id="
        + OAuth2Params.clientId + "&client_secret=" + OAuth2Params.secret
        + "&scope=userbook userinfo directory workspace conversation document blog actualites avatar";
      return $http.post(url, data, options).then(function (result) {
        console.log(result);
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

  var tmpRemMe = localStorage.getItem("RememberMe");
  if (tmpRemMe && tmpRemMe != null)
  {
    if (tmpRemMe == "true")
      $scope.rememberMe = true;
    else
      $scope.rememberMe = false;
  }
  else {
    localStorage.setItem("RememberMe", "false");
    $scope.rememberMe = false;
  }
  console.log($scope.rememberMe);

  if ($scope.rememberMe == true && localStorage.getItem("refresh") != null) {
    OAuthService.doRefresh(localStorage.getItem("refresh").toString()).then(function (response) {
      $scope.wrongLogin = false;
      localStorage.setItem('access_token', response.data.access_token);
      $state.go('app.actualites');
    }, function errorCallback(response) {
      $scope.rememberMe = false;
      localStorage.setItem("RememberMe", "false");
      $state.go("login");
    })
  }

  $scope.doLogin= function(user){
    //login();
    console.log("user: "+user);
    OAuthService.doAuthent(user.username, user.password).then(function(response){
      console.log(response.data);
      $scope.wrongLogin = false;
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('password', response.data.access_token);
      if ($scope.rememberMe == true) {
        localStorage.setItem('refresh', response.data.refresh_token);
      }
      $state.go('app.actualites');
    }, function errorCallback(response) {
       $scope.wrongLogin = true;
       $scope.rememberMe = false;
       localStorage.setItem("RememberMe", "false");
       $state.go("login");
    })
  }

  $scope.rememberMeClicked = function()
  {
    if ($scope.rememberMe == false)
    {
      $scope.rememberMe = true;
      localStorage.setItem("RememberMe", "true");
    }
    else
      {
        $scope.rememberMe = false;
        localStorage.setItem("RememberMe", "false");
      }
      console.log("changed remember me to " + $scope.rememberMe);
  }
})
