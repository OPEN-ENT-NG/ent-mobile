angular.module('ent.message_services', [])

.service('MessagerieServices', function($http, $q, domainENT){
  this.getMessagesFolder = function (url) {
    return $http.get(url);
  }

  this.deleteSelectedMessages = function(arrayMessages){
    console.log(arrayMessages);
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];

    angular.forEach(arrayMessages, function(item) {
      var deferredItemList = $q.defer();
      $http.put(domainENT+"/conversation/trash?id="+item.id).then(function(resp) {
        combinedItems = combinedItems.concat(resp.data);
        deferredItemList.resolve();
      });
      promises.push(deferredItemList.promise);
    });

    $q.all(promises).then(function() {
      deferredCombinedItems.resolve(combinedItems);
    });
    return deferredCombinedItems.promise;
  }

  this.getMessage = function(id){
    return $http.get(domainENT+"/conversation/message/"+id);
  }

  this.trashMessage = function (id){
    return $http.put(domainENT+"/conversation/trash?id="+id);
  }

  this.getCustomFolders = function(){
    return $http.get(domainENT+"/conversation/folders/list");
  }

  this.getContactsService = function(){
    return $http.get(domainENT+"/conversation/visible");
  }
})
