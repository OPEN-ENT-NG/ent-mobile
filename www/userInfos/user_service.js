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

  this.getTranslation = function () {
    return $http.get(domainENT+'/userbook/i18n');
  }
})

.controller('UserCtrl', function(UserFactory, $scope){

  UserFactory.getTranslation().then(function(result){
    $scope.translationUser = result.data;
  }), function errorCallback(response) {
    alert('Erreur '+response.status+' '+response.data.error);
  };

  UserFactory.getCurrentUser().then(function(res){
    UserFactory.whoAmI(res.data.userId).then(function(response) {
      $scope.myUser = response.data.result[0];
      $scope.myUser.photo = $scope.setProfileImage($scope.myUser.photo, res.data.userId);
      $scope.myUser.type = $scope.myUser.type[0];
      localStorage.setItem('myUser',  $scope.myUser);
    })
  }), function errorCallback(response) {
    alert('Erreur '+response.status+' '+response.data.error);
  };
})
