angular.module('ent.actualites_service', [])

.service('InfosService', function($http, domainENT){
  this.getAllInfos = function(){
    return $http.get(domainENT+"/actualites/infos");
  }

  this.getAllThreads = function(){
    return $http.get(domainENT+"/actualites/threads");
  }

  this.getStatusInfos = function(){
    return [
      {nom: "filters.drafts", status: 1},
      {nom: "filters.submitted", status: 2},
      {nom: "filters.published", status: 3}
    ];
  }

  this.getTranslation = function(){
    return $http.get(domainENT+"/actualites/i18n");
  }
})
