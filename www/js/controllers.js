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

.controller('AppCtrl', function(){
  
})
