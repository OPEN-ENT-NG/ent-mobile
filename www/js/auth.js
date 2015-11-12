angular.module('ent.auth', [])
.controller('LoginCtrl', function($scope, $http, $state) {

  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';

  $scope.doLogin = function() {
    var ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=mobile-ong&redirect_uri=http://localhost','_blank','location=no','toolbar=no');
    ref.addEventListener('loadstop', function(event) {
      var url =event.url;
      var code =url.substring(url.indexOf("code=")+5, url.lastIndexOf("&"));
      alert("code: " + code);
      $http({
        method: "post",
        url: "https://recette-leo.entcore.org/auth/oauth2/token",
        data: "redirect_uri=http://localhost" +
        "&grant_type=authorization_code" + "&code=" + code+"&username=aurelie.drouillac&passowrd=0ng_1234",
        headers: {'Authorization': 'Basic bW9iaWxlLW9uZzptb2JpbGUtb25nLXNlcmNyZXQ='} })
        .success(function(data) {
          accessToken = data.access_token;
          alert("accessToken: " + accessToken);
          $http({
            method: "post",
            url: "https://recette-leo.entcore.org/auth/oauth2/userinfo",
            headers: {'Authorization': 'Bearer '+access_token}})
            .success(function(data) {
              alert("info: " + data);
            })
            .error(function(data, status) {
              alert("ERROR: " + data);
            });
        })
        .error(function(data, status) {
          alert("ERROR: " + data.error);
        });
        ref.close();
      });
    }
  })
  ;
