angular.module('ent.auth', [])
.controller('LoginCtrl', function($scope, $http, $cordovaInAppBrowser, $state, domainENT) {

  document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
    if(localStorage.getItem('access_token')!= null){
      $state.go('app.actualites');
    }
  }

  $scope.doLogin= function(){
    login();
  }

  function login(){
    if(localStorage.getItem('access_token')== null){
      ref = window.open(domainENT+'/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=appmobile&redirect_uri='+domainENT,'_self','location=no','toolbar=no', 'clearcache=yes', 'clearsessioncache=yes');
      ref.addEventListener('loadstart', function(event) {
        var url = event.url;
        if(url.startsWith(domainENT+"/?code=")) {
          localStorage.setItem('code', url.substring(url.indexOf("code=")+5, url.lastIndexOf("&")));
          ref.close();
          $state.go('app.actualites');
        }
      });
    } else {
      $state.go('app.actualites');
    }
  }
})
