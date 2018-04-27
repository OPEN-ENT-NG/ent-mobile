angular.module('ent.pronotes_service', ['ent.request'])

.service('PronoteService', function($http, domainENT, RequestService){
  this.getAllApps = function(){
    return RequestService.get(domainENT+"/applications-list");
  }

  // this.getTranslation = function(){
  //   return $http.get(domainENT+'/applications-list/i18n');
  // }

});
