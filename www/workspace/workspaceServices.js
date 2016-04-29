angular.module('ent.workspace_service', [])

.service('WorkspaceService', function($http, domainENT){

  this.getFoldersByFilter = function(filter){
    // return $http.get(domainENT+"/workspace/folders/list?filter="+filter);

    return $http.get('/folders_owner.json');
  }

  this.getDocumentsByFilter = function(filter){
    // return $http.get(domainENT+"/workspace/documents?filter="+filter);

    return $http.get('/documents_owner.json');
  }

  this.getTranslation = function(){
    return $http.get(domainENT+"/workspace/i18n");
  }

})
