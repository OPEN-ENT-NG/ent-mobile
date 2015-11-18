angular.module('ent.auth', [])
.controller('LoginCtrl', function($scope, $http, $state) {

  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';

  $scope.doLogin = function() {
    //
    // if(localStorage.getItem("access_token")){
    //   alert('access');
    //   $state.go('app.actualites');
    // } else {
    //
    //   if(localStorage.getItem("refresh_token")){
    //     alert('refresh');
    //     $http({
    //       method: "post",
    //       url: "https://recette-leo.entcore.org/auth/oauth2/token",
    //       data: "redirect_uri=https://recette-leo.entcore.org" +
    //       "&grant_type=refresh_token" + "&code=" + code,
    //       headers: {'Authorization': 'Basic bW9iaWxlLW9uZzptb2JpbGUtb25nLXNlcmNyZXQ='} })
    //       .success(function(data) {
    //         accessToken = data.access_token;
    //         alert("accessToken: " + data.access_token);
    //         alert("refreshToken: " +  data.refresh_token);
    //         localStorage.setItem("access_token",data.access_token);
    //         localStorage.setItem("refresh_token", data.refresh_token);
    //         ref.close();
    //         $state.go('app.actualites');
    //       })
    //       .error(function(data, status) {
    //         ref.close();
    //         alert("ERROR: " + data.error);
    //       });
    //     } else {
          var ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=mobile-ong&redirect_uri=https://recette-leo.entcore.org','_blank','location=no','toolbar=no');

          ref.addEventListener('loadstart', function(event) {

            var url = event.url;
            if((event.url).startsWith("https://recette-leo.entcore.org/?code=")) {
              var code =url.substring(url.indexOf("code=")+5, url.lastIndexOf("&"));
              $http({
                method: "post",
                url: "https://recette-leo.entcore.org/auth/oauth2/token",
                data: "redirect_uri=https://recette-leo.entcore.org" +
                "&grant_type=authorization_code" + "&code=" + code,
                headers: {'Authorization': 'Basic bW9iaWxlLW9uZzptb2JpbGUtb25nLXNlcmNyZXQ='} })
                .success(function(data) {
                  accessToken = data.access_token;
                  alert("accessToken: " + data.access_token);
                  alert("refreshToken: " +  data.refresh_token);
                  localStorage.setItem("access_token",data.access_token);
                  localStorage.setItem("refresh_token", data.refresh_token);
                  ref.close();
                  $state.go('app.actualites');
                })
                .error(function(data, status) {
                  ref.close();
                  alert("ERROR: " + data.error);
                });
              }
          });
        //}
      //}
    }

    $scope.logout = function(){
      localStorage.setItem("access_token", "");
      localStorage.setItem("refresh_token", "");

      $state.go('login');
    }
});
