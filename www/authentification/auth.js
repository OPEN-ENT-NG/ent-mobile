angular.module('ent.auth', ['ent.user'])
.controller('LoginCtrl', function($scope, $http, $cordovaInAppBrowser, $state, domainENT, SkinFactory, $ionicLoading) {


  document.addEventListener("deviceready", onDeviceReady, false);

  function onDeviceReady() {
    // navigator.splashscreen.show();

    if(localStorage.getItem('code')!=null){
      navigator.splashscreen.hide();
      $state.go("app.actualites");
    } else {
      login();

    }
  }

  $scope.doLogin= function(){
    // $ionicLoading.show({
    //   template: '<i class="spinnericon- "></i>'
    // });
    // console.log("show splashscreen");
    // navigator.splashscreen.show();

    // SkinFactory.getSkin().then(function(res) {
    //   console.log(res);
    //   localStorage.setItem('skin', res.data.skin)
    //   console.log(localStorage.getItem('skin'))
    //   $ionicLoading.hide();
    // }, function errorCallback(response) {
    //   alert('Erreur '+response.status+' '+response.data.error)
    // })
    login();
    $state.go("app.actualites");


  }

  function login(){
    var ref = window.open(domainENT+'/auth/oauth2/auth?response_type=code&state=blip&scope=userinfo&client_id=appmobile&redirect_uri='+domainENT,'_self','location=no','toolbar=no', 'clearcache=yes', 'clearsessioncache=yes');
    ref.addEventListener('loadstart', function(event) {
      var url = event.url;
      if(url.startsWith(domainENT+"/?code=")) {

        localStorage.setItem('code', url.substring(url.indexOf("code=")+5, url.lastIndexOf("&")));
        ref.close();
        console.log("hide splashscreen");
        navigator.splashscreen.hide();

      }
    });

  }

  function getToken(){

    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http.defaults.headers.post['Accept'] = 'application/json; charset=UTF-8';
    // $http.defaults.headers.common.Authorization = 'Basic bW9iaWxlLW9uZzptb2JpbGUtb25nLXNlcmNyZXQ=';

    $http.defaults.headers.common.Authorization = 'Basic YXBwbW9iaWxlOnNlY3JldA==';


    $http({
      method: "post",
      url: domainENT+"/auth/oauth2/token",
      data: "redirect_uri="+domainENT+"&grant_type=authorization_code&code=" + localStorage.getItem('code')
    }).then(function successCallback(response) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      $state.go('app.actualites');

    }, function errorCallback(response) {
      alert('Erreur '+response.status+' '+response.data.error);
    });
  }
})
