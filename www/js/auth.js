angular.module('ent.auth', [])

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}])

.controller('LoginCtrl', function($scope, $http, $cordovaInAppBrowser, $state, $ionicPlatform) {

  var ref;
  $ionicPlatform.ready(function() {
    // Any thing you can think of
    if(!localStorage.getItem('access_token')) {
      openBrowser();
    } else {
      $state.go('app.actualites');
    }
  });

  function openBrowser(){
    ref = window.open('https://recette-leo.entcore.org/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=mobile-ong&redirect_uri=https://recette-leo.entcore.org','_blank','location=no','toolbar=no', 'clearcache=yes', 'clearsessioncache=yes');
    ref.addEventListener('loadstop', function(event) {
      var url = event.url;
      if(url.startsWith("https://recette-leo.entcore.org/?code=")) {
        localStorage.setItem('code', url.substring(url.indexOf("code=")+5, url.lastIndexOf("&")));
        //alert(url.substring(url.indexOf("code=")+5, url.lastIndexOf("&")));
      }
    });

    ref.addEventListener('loadstart', function(event){
      if(event.url == "https://recette-leo.entcore.org/timeline/timeline"){
        ref.close();
        getToken();
        $state.go('app.actualites');

      }
    });
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
    //  alert('token: '+response.data.access_token);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);




//      $state.go('app.actualites');

    }, function errorCallback(response) {
      alert('Erreur '+response.status+' '+response.data.error);
    });
  }
})
