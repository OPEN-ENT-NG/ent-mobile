angular.module('ent.actualites_service', ['ent.request'])

.service('ActualitesService', function(domainENT, RequestService){
  this.getAllInfos = function(){
    return RequestService.get(domainENT+"/actualites/infos");
  }

  this.getAllThreads = function(){
    return RequestService.get(domainENT+"/actualites/threads");
  }

  this.getTranslation = function(){
    return RequestService.get(domainENT+"/actualites/i18n");
  }
})
