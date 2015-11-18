angular.module('ent.controllers', [])


.controller('UserInfoCtrl', function($scope, $http) {
  $http.defaults.headers.common.Authorization = 'Bearer '+localStorage.getItem("access_token");
  $http.get('https://recette-leo.entcore.org/auth/oauth2/userinfo').then(function(resp) {
    $scope.userinfo = resp.data;
    alert(resp.data.username);
  }, function(err) {
    alert('ERR', err.data.status);
  })
})


.controller('AppCtrl', function($scope, $http, $cordovaInAppBrowser) {

  document.addEventListener("deviceready", onDeviceReady, false);

  var ref;
  function onDeviceReady() {
    if(!localStorage.getItem('access_token')){
      ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=mobile-ong&redirect_uri=https://recette-leo.entcore.org','_blank','location=no','toolbar=no', 'clearcache=yes', 'clearsessioncache=yes');
      ref.addEventListener('loadstart', function(event) {
        var url = event.url;
        if(url.startsWith("https://recette-leo.entcore.org/?code=")) {
          localStorage.setItem('code', url.substring(url.indexOf("code=")+5, url.lastIndexOf("&")));
          getToken();
        }
      });
    }
  }

  function getToken(){

    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';
    $http.defaults.headers.common.Authorization = 'Basic bW9iaWxlLW9uZzptb2JpbGUtb25nLXNlcmNyZXQ=';

    $http({
      method: "post",
      url: "https://recette-leo.entcore.org/auth/oauth2/token",
      data: "redirect_uri=https://recette-leo.entcore.org&grant_type=authorization_code&code=" + localStorage.getItem('code')
    }).then(function successCallback(response) {
      alert('token: '+response.data.access_token);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      ref.close();

    }, function errorCallback(response) {
      alert('Erreur '+response.status+' '+response.data.error);
    });
  }
})
