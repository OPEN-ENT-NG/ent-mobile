angular.module('ent.user', ['ent.request'])

  .service('SkinFactory', function($http, domainENT, RequestService){
    this.getSkin = function(){
      return $http.get(domainENT+"/theme");
    }
  })

  .service('UserFactory', function(domainENT, $http, RequestService){

    this.whoAmI= function (userId) {
      return RequestService.get(domainENT+"/userbook/api/person?id="+userId);
    };

    this.getCurrentUser = function () {
      return RequestService.get(domainENT+'/auth/oauth2/userinfo');
    };

    this.getTranslation = function () {
      return RequestService.get(domainENT+'/userbook/i18n');
    }
  })

  .service('TranslationService', function(UserFactory) {

    this.synchronized = false;
    this.translationUser = {};

    this.getAllTraductions = function() {
      if(!this.synchronized) {
        var that = this;
        UserFactory.getTranslation().then(function (result) {
          that.translationUser = result.data;
          that.synchronized = true;
        }, function (response) {
          $scope.showAlertError();
          that.synchronized = true;
        });
      }
    };

    this.getTraduction = function(key) {
      if(this.translationUser.hasOwnProperty(key)) {
        return this.translationUser[key];
      } else {
        return key;
      }
    };
  })

  .controller('UserCtrl', function(UserFactory, TranslationService, $scope, $rootScope){

    getUser();
    TranslationService.getAllTraductions();

    function getUser(){
      UserFactory.getCurrentUser().then(function(res){
        UserFactory.whoAmI(res.data.userId).then(function(response) {
          $rootScope.myUser = response.data.result[0];
          $rootScope.myUser.photo = setProfileImage($scope.myUser.photo, res.data.userId);
          $rootScope.myUser.type = "directory."+$rootScope.myUser.type[0];
          $rootScope.myUser.translatedType = TranslationService.getTraduction($rootScope.myUser.type);
          console.log($rootScope.myUser);
        })
      }, function errorCallback(response) {
        $scope.showAlertError();
      });
    }
  });
