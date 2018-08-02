angular.module('ent.profile_service', ['ent.profile'])

  .service('ProfileService', function(domainENT, RequestService,$http, $rootScope){

    this.getUser = function () {
      $http.defaults.headers.common['Accept'] = '*/*';
      return RequestService.get(domainENT+"/directory/user/"+$rootScope.myUser.id);
    }
  });
