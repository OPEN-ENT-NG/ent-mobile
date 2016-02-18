angular.module('ent.message_services', [])

.service('MessagerieServices', function($http, $q, domainENT){
  this.getMessagesFolder = function (url) {
    return $http.get(url);
  }

  this.deleteSelectedMessages = function(arrayMessages, nameFolder){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    var url = nameFolder=="TRASH" ? domainENT+"/conversation/delete?id=":domainENT+"/conversation/trash?id=";

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

  this.trashMessage = function (id, nameFolder){
    var url = nameFolder=="TRASH" ? domainENT+"/conversation/delete?id=":domainENT+"/conversation/trash?id=";
    return $http.put(url+id);
  }

  this.getMessage = function(id){
    return $http.get(domainENT+"/conversation/message/"+id);
  }

  this.getCustomFolders = function(){
    return $http.get(domainENT+"/conversation/folders/list");
  }

  this.moveMessages = function(messagesToMove, folderId){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    angular.forEach(messagesToMove, function(message) {
      var deferredItemList = $q.defer();
      $http.put(domainENT+"/conversation/move/userfolder/"+folderId+"?id="+message.id).then(function(resp) {
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

  this.moveMessage = function(messageId, folderId){
    return $http.put(domainENT+"/conversation/move/userfolder/"+folderId+"?id="+messageId);
  }

  this.getContactsService = function(){
    return $http.get(domainENT+"/conversation/visible");
  }
})

.factory("MoveMessagesPopupFactory", function ($ionicPopup, MessagerieServices) {

  function getPopup(scope) {
    MessagerieServices.getCustomFolders().then(function (resp) {
      scope.folders = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    });

    scope.selectFolder = function(message){
      scope.choice = message.id;
    }
    return $ionicPopup.show({

      templateUrl: 'templates/popup_move_mail.html',
      title: 'Déplacement de messages',
      subTitle: 'Choix du dossier',
      scope: scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'bar-positive',
          onTap: function(e) {
            if (!scope.choice) {
              e.preventDefault();
            } else {
              return scope.choice;
            }
          }
        },
      ]
    })
  }
  return {
    getPopup: getPopup
  };
})
.factory("DeleteMessagesPopupFactory", function ($ionicPopup, MessagerieServices) {

  function getPopup() {

    return $ionicPopup.confirm({
      title: 'Suppression de message(s)',
      template: 'Êtes-vous sûr(e) de vouloir supprimer ce(s) message(s) ?'
    })
  }
  return {
    getPopup: getPopup
  };
});
