angular.module('ent.user', [])

.service('SkinFactory', function($http, domainENT){
  this.getSkin = function(){
    return  $http.get(domainENT+"/theme");
  }
})

.service('UserFactory', function(domainENT, $http){

  this.whoAmI= function (userId) {
    return $http.get(domainENT+"/userbook/api/person?id="+userId);
  }

  this.getCurrentUser = function () {
    return $http.get(domainENT+'/auth/oauth2/userinfo');
  }
})

.controller('UserCtrl', function(SkinFactory, UserFactory, $scope){


  UserFactory.getCurrentUser().then(function(res){
    UserFactory.whoAmI(res.data.userId).then(function(response) {
      $scope.myUser = response.data.result[0];
      $scope.myUser.photo = $scope.setCorrectImage($scope.myUser.photo, "/../../img/illustrations/no-avatar.jpg");
      localStorage.setItem('myUser',   $scope.myUser);

      console.log($scope.myUser);
    })
  }), function errorCallback(response) {
    alert('Erreur '+response.status+' '+response.data.error);
  };
})
