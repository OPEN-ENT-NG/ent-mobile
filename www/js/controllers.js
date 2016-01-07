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

.controller('UserInfoCtrl', function($scope, $http, $state) {
  $http.get('https://recette-leo.entcore.org/auth/oauth2/userinfo').then(function(resp) {
    $scope.userinfo = resp.data;
  }, function(err) {
    alert('ERR', err.data.status);
  })

  $scope.jumpToInbox = function(){
    $state.go("app.messagerie");
    // alert("messagerie");
    // $state.go("app.inbox");
  }
})

.controller('AppCtrl', function($scope, $sce, $state, $ionicHistory){

  $scope.renderHtml = function(text){
    return $sce.trustAsHtml(text);
  }

  $scope.logout = function(){
    localStorage.clear();
    $ionicHistory.clearHistory()
    $state.go("login");
  }
})
