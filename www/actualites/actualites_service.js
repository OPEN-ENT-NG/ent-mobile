angular.module('ent.actualites_service', [])

.service('InfosService', function($http, domainENT){
  this.getAllInfos = function(){
    return $http.get(domainENT+"/actualites/infos");
  }

  this.getAllThreads = function(){
    return $http.get(domainENT+"/actualites/threads");
  }

  this.getTranslation = function(){
    return $http.get(domainENT+"/actualites/i18n");
  }
})
