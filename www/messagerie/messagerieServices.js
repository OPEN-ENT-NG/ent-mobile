angular.module('ent.message_services', ['ent.request'])

.service('MessagerieServices', function($http, $q, domainENT, RequestService){

  var configHeaders = {
    headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8", 'Authorization': $http.defaults.headers.common['Authorization'] }
  };


  this.postAttachment = function(messageId, attachment){
    return RequestService.post(domainENT+"/conversation/message/"+ messageId +"/attachment",  attachment, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined, 'Authorization': $http.defaults.headers.common['Authorization'] }
    });
  }

  this.getMessagesFolder = function (url) {
    return RequestService.get(url);
  }

  this.getCustomFolders = function(){
    return RequestService.get(domainENT+"/conversation/folders/list");
  }

  this.getExtraFolders = function(locationId){
    var urlEnd = locationId == "TRASH" ? "trash":"parentId="+locationId;
    console.log(domainENT+"/conversation/folders/list?"+urlEnd);
    return RequestService.get(domainENT+"/conversation/folders/list?"+urlEnd);
  }

  this.getCountUnread = function(folders){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    angular.forEach(folders, function(folderId, folderIndex) {
      var deferredItemList = $q.defer();
      var toRequest = domainENT+"/conversation/count/"+folderId+"?unread=";
      if (folderId == "DRAFT")
        toRequest += "false";
      else
        toRequest += "true";
      if (folderId != "INBOX" && folderId != "OUTBOX" && folderId != "DRAFT" && folderId != "THRASH")
        toRequest += "&restrain";
      RequestService.get(toRequest).then(function(resp) {
        combinedItems[folderIndex] = resp.data;
        deferredItemList.resolve();
      });
      promises.push(deferredItemList.promise);
    });

    $q.all(promises).then(function() {
      deferredCombinedItems.resolve(combinedItems);
    });
    return deferredCombinedItems.promise;
  }

  this.restoreSelectedMessages = function(arrayMessages){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];

    angular.forEach(arrayMessages, function(item) {
      var deferredItemList = $q.defer();
      RequestService.put(domainENT+"/conversation/restore?id="+item.id).then(function(resp) {
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

  this.restoreMessage = function (id){
    return RequestService.put(domainENT+"/conversation/restore?id="+id);
  }

  this.deleteSelectedMessages = function(arrayMessages, nameFolder){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    angular.forEach(arrayMessages, function(item) {
      var deferredItemList = $q.defer();
      console.log(item);

      if(nameFolder=="trash"){
        RequestService.delete(domainENT+"/conversation/delete?id="+item.id).then(function(resp) {
          combinedItems = combinedItems.concat(resp.data);
          deferredItemList.resolve();
        });
        promises.push(deferredItemList.promise);
      } else {
        RequestService.put(domainENT+"/conversation/trash?id="+item.id).then(function(resp) {
          combinedItems = combinedItems.concat(resp.data);
          deferredItemList.resolve();
        });
        promises.push(deferredItemList.promise);
      }
    });

    $q.all(promises).then(function() {
      deferredCombinedItems.resolve(combinedItems);
    });
    return deferredCombinedItems.promise;
  }

  this.getMessage = function(id){
    return RequestService.get(domainENT+"/conversation/message/"+id);
  }

  this.moveMessages = function(messagesToMove, folderId){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    angular.forEach(messagesToMove, function(message) {
      var deferredItemList = $q.defer();
      RequestService.put(domainENT+"/conversation/move/userfolder/"+folderId+"?id="+message.id).then(function(resp) {
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
    return RequestService.put(domainENT+"/conversation/move/userfolder/"+folderId+"?id="+messageId);
  }

  this.getContactsService = function(){
    return RequestService.get(domainENT+"/conversation/visible");
  }

  this.saveWithId = function(id, mailData){
    return RequestService.put(domainENT+'/conversation/draft/'+id,mailData, configHeaders );
  }

  this.saveNewDraft = function (mailData){
    return RequestService.post(domainENT+'/conversation/draft',mailData, configHeaders );
  }

  this.sendMail = function(mailData){
    return RequestService.post(domainENT+'/conversation/send?id='+mailData.id,mailData, configHeaders );
  }

  this.sendReplyOne = function(mailData){
    return RequestService.post(domainENT+'/conversation/send?In-Reply-To='+mailData.id,mailData, configHeaders );

  }

  this.getTranslation = function(){
    return RequestService.get(domainENT+'/conversation/i18n');
  }

  this.getNonPersonalFolders = function(){
    return [
      {
        id: "INBOX",
        name: "inbox"
      },
      {
        id: "OUTBOX",
        name: "outbox"
      },
      {
        id: "DRAFT",
        name: "draft"
      },
      {
        id: "TRASH",
        name: "trash"
      }
    ];
  }

  this.getPersonalFolderIds = function(){
    return[ "INBOX", "OUTBOX", "DRAFT", "TRASH"];
  }

  this.getStatusRedactionMessage = function(){
    return ["DRAFT", "REPLY_ONE", "REPLY_ALL","FORWARD"];
  }
})

.factory("MoveMessagesPopupFactory", function ($ionicPopup, MessagerieServices, $rootScope) {

  function getPopup(scope) {
    scope.choice = '';
    MessagerieServices.getCustomFolders().then(function (resp) {
      scope.folders = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    });

    scope.selectFolder = function(message){
      scope.choice = message.id;
      console.log("in select folder");
      console.log(scope.choice);
    };

    return $ionicPopup.show({

      templateUrl: 'messagerie/popup_move_mail.html',
      title: $rootScope.translationConversation["mail.move"],
      subTitle: $rootScope.translationConversation["destination.folder"],
      scope: scope,
      buttons: [
        { text: $rootScope.translationConversation["cancel"] },
        {
          text: '<b>Ok</b>',
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
.factory("DeleteMessagesPopupFactory", function ($ionicPopup, $rootScope) {

  function getPopup() {
    return $ionicPopup.confirm({
      title: $rootScope.translationConversation["delete"],
      template: 'Êtes-vous sûr(e) de vouloir supprimer ce(s) message(s) ?',
      cancelText: $rootScope.translationConversation["cancel"]
    })
  }
  return {
    getPopup: getPopup
  };
})
.factory("AlertMessagePopupFactory", function ($ionicPopup) {

  function getPopup(titre, message) {
    return $ionicPopup.alert({
      title: titre,
      template: message
    })
  }
    return {
      getPopup: getPopup
    };
  });
