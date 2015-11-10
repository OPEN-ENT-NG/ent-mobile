var requestToken = "";
var accessToken = "";
var clientId = "mobile-ong";

//var clientSecret = "client_secret_here";

angular.module('ent.auth', [])
.controller('LoginCtrl', function($scope, $http, $state) {

  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';


    $scope.doLogin = function() {
      console.log("coucou avant http");
  /*    var ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?client_id=' + clientId +
        '&redirect_uri=https://localhost&scope=userinfo&response_type=code&state=coucou','_blank','location=no','toolbar=no');*/

        var ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=mobile-ong&redirect_uri=http://localhost','_blank','location=no','toolbar=no');


        ref.addEventListener('loadstop', function(event) {
            var url =event.url;
            var code =url.substring(url.indexOf("code=")+5, url.lastIndexOf("&"));
            alert("code: " + code);

//installer le plugin base 64
            $http({
              method: "post",
              url: "https://recette-leo.entcore.org/auth/oauth2/token",
              data: "redirect_uri=http://localhost" +
                "&grant_type=authorization_code" + "&code=" + code,
               headers: {'Authorization': 'Basic bW9iaWxlLW9uZzptb2JpbGUtb25nLXNlcmNyZXQ='} })
                .success(function(data) {
                    accessToken = data.access_token;
                      alert("accessToken: " + accessToken);
                })
                .error(function(data, status) {
                    alert("ERROR: " + data);
                });

            ref.close();
        });
    }


  })
  ;
