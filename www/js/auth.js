var requestToken = "";
var accessToken = "";
var clientId = "mobile-ong";

//var clientSecret = "client_secret_here";

angular.module('ent.auth', [])
.controller('LoginCtrl', function($scope, $http, $location) {

    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';


    $scope.doLogin = function(user) {
      console.log("coucou avant http");
        var ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?client_id=' + clientId + '&redirect_uri=https://recette-leo.entcore.org&scope=userinfo&response_type=code&state=coucou&access_type=offline', '_blank');
        ref.addEventListener('loadstart', function(event) {
            if((event.url).startsWith("https://recette-leo.entcore.org")) {
              console.log("coucou");
                requestToken = (event.url).split("code=")[1];

                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';
                $http.defaults.headers.post['Authorisation'] = 'Basic sdvkoopkfopzekfpoezkfopezkfpok';

                $http({
                  method: "POST",
                  url: "https://recette-leo.entcore.org/auth/oauth2/token",
                  data: "grant_type=authorization_code&code=" + requestToken + "&redirect_uri=https://recette-leo.entcore.org"
                })
                .success(function(data) {
                  accessToken = data.access_token;
                  $location.path("/secure");
                })
                .error(function(data, status) {
                    alert("ERROR: " + data);
                });
                ref.close();
            } else {
                console.log("pas coucou");
            }
        });
    }

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }
  })
  ;
