angular.module('ent.pronotes_service', [])

.service('PronoteService', function($http, domainENT){
  this.getAllPronotes = function(){
    return $http.get(domainENT+"/applications-list");
  }

  // this.getTranslation = function(){
  //   return $http.get(domainENT+'/applications-list/i18n');
  // }

});
