angular.module('ent.controllers', [])

.factory('sessionInjector', [function (SessionService) {

  var sessionInjector = {
    request: function(config) {
      if (localStorage.getItem('access_token')) {
        config.headers['Authorization'] = 'Bearer '+localStorage.getItem('access_token')

      }
      return config;
    },

    responseError: function(res) {
      //    alert('besoin de refreshToken');
      return res;
    }
  };
  return sessionInjector;
}])

.config(function($httpProvider) {
  $httpProvider.interceptors.push('sessionInjector');
  $httpProvider.defaults.withCredentials = true;
})

.controller('UserInfoCtrl', function($scope, $http) {
  $http.get('https://recette-leo.entcore.org/auth/oauth2/userinfo').then(function(resp) {
    $scope.userinfo = resp.data;
  }, function(err) {
    alert('ERR', err.data.status);
  })
})

.controller('AppCtrl', function($scope, $sce, $state, $sanitize){

  $scope.renderHtml = function(text){
    text = text.replace(/="\/workspace/g, "=\"https://recette-leo.entcore.org/workspace");

    var regex = /href="([\S]+)"/g;
    var newString = $sanitize(text).replace(regex, "onClick=\"window.open('$1', '_blank', 'location=no')\"");
    console.log(newString);
    return $sce.trustAsHtml(newString);
  }

  $scope.logout = function(){
    localStorage.clear();
    $state.go("login");
  }
})
