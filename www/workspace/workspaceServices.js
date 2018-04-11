angular.module('ent.workspace_service', ['ion-tree-list', 'ngCookies'])

.service('WorkspaceService', function($http, domainENT, $q, $cookies){

  // var configHeaders = {
  //   headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
  //     'Authorization': $http.defaults.headers.common['Authorization'] }
  // };

  var transformRequestForActions = function(dataObj){
    var str = [];
    for(var field in dataObj){
      if(field === 'actions' && dataObj[field]){
        for(var i = 0 ; i < dataObj[field].length ; i++){
          str.push("actions=" + encodeURIComponent(dataObj[field][i]));
        }
      } else {
        str.push(encodeURIComponent(field)+"="+encodeURIComponent(dataObj[field]));
      }
    }
    return str.join("&");
  }

  this.getFoldersByFilter = function(filter, hierarchical){
    return $http.get(domainENT+"/workspace/folders/list?filter="+parametersUrl(filter, hierarchical))
  }

  this.getDocumentsByFilter = function(filter,hierarchical){
    return $http.get(domainENT+"/workspace/documents?filter="+parametersUrl(filter,hierarchical))
  }

  this.getDocumentsByFolderAndFilter = function(folderName,filter){
    return $http.get(domainENT+'/workspace/documents/'+folderName+'?filter='+filter+'&hierarchical=true&_='+getTimeInMillis())
  }

  this.getTrashFilesContent = function(){
    return $http.get(domainENT+"/workspace/documents/Trash?filter=owner&_="+getTimeInMillis())
  }

  this.getCompleteFoldersByFilter = function(filter) {
    return $http.get(domainENT+'/workspace/folders/list?filter=' + filter + '&_='+getTimeInMillis())
  }

  this.getSharingItemDatas = function(idItem) {
      return $http.get(domainENT+'/workspace/share/json/'+idItem);
//      return $http.get(domainENT+'/workspace/share/json/'+idItem, {headers : {'XSRF-TOKEN' : $cookies.get('XSRF-TOKEN')}});
  }

  this.updateSharingActions = function (idItem, sharingDatas, isRemove){
    console.log(idItem);
    console.log(sharingDatas);
    var str = '' ;
    if(!isRemove){
      str = 'json' ;
    }else{
      str = 'remove' ;
    }
    return $http.put(domainENT+'/workspace/share/'+str+'/'+idItem, sharingDatas, {
      transformRequest: transformRequestForActions
    });
  }

  this.commentDocById = function (id, comment){
    return $http.post(domainENT+'/workspace/document/'+id+'/comment', "comment="+ comment)
  }

  this.renameDoc = function (id, newName){
    return $http.put(domainENT+'/workspace/rename/document/'+id, {name: newName})
  }

  this.renameFolder = function (id, newName){
    return $http.put(domainENT+'/workspace/folder/rename/'+id, {name: newName})
  }

  this.renameItem = function (item, type, newName){
    console.log(item);
    var urlType = type =='folder' ? 'folder/rename/'+item._id : 'rename/document/'+item._id
    console.log(urlType);
    return $http.put(domainENT+'/workspace/'+urlType , {name: newName})
  }


  this.trashDoc = function (id){
    return $http.put(domainENT+'/workspace/document/trash/'+id)
  }

  this.versionDoc = function (id){
    return $http.get(domainENT+'/workspace/document/'+id+'/revisions?_='+getTimeInMillis())
  }

  this.putNewVersion = function (id, newVersion){
    return $http.put(domainENT+'/workspace/document/'+id+'?thumbnail=120x120&thumbnail=290x290', newVersion, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    });
  }

  this.deleteVersion = function(idDoc, idVersion){
    return $http.delete(domainENT+'/workspace/document/'+idDoc+'/revision/'+idVersion)
  }

  this.uploadDoc = function(doc){
    return $http.post(domainENT+'/workspace/document?thumbnail=120x120&thumbnail=290x290&quality=0.8', doc, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    });
  }

  this.moveDoc = function(idDoc, folderName){
    folderName = folderName=='owner' ? '':'/'+folderName
    return $http.put(domainENT+'/workspace/documents/move/'+idDoc+folderName)
  }

  this.moveSelectedDocs = function(arrayDocs, folderName){
    var promises = []
    var deferredCombinedItems = $q.defer()
    var combinedItems = []
    folderName = folderName=='owner' ? '':'/'+folderName

    angular.forEach(arrayDocs, function(item) {
      var deferredItemList = $q.defer();
      $http.put(domainENT+'/workspace/documents/move/'+item._id+folderName).then(function(resp) {
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

  this.moveSelectedFolders = function(arrayFolders, folderName){
    var promises = []
    var deferredCombinedItems = $q.defer()
    var combinedItems = []
    if(folderName=='owner'){
      folderName=''
    }

    angular.forEach(arrayFolders, function(item) {
      var deferredItemList = $q.defer();
      $http.put(domainENT+'/workspace/folder/move/'+item._id,"path="+folderName).then(function(resp) {
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


  this.copyDoc = function(idDoc, folderName){
    folderName = folderName=='owner' ? '':'/'+folderName
    return $http.post(domainENT+'/workspace/documents/copy/'+idDoc+folderName)
  }

  this.trashFolder = function (id){
    return $http.put(domainENT+'/workspace/folder/trash/'+id)
  }

  this.createFolder = function (folderName, path){
    var data = "name="+folderName;
    data = path!='owner' ? "name="+folderName+"&path="+path.folder : data;
    console.log(data);
    return $http.post(domainENT+'/workspace/folder',data)
  }

  this.copyFolder = function (folder, path){
    var data = "name="+folder.name;
    data = path!='owner' ? "name="+folder.name+"&path="+path: data;
    console.log(data);
    return $http.put(domainENT+'/workspace/folder/copy/'+folder._id, data)
  }

  this.copySelectedFolders = function(arrayFolders, path){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];

    angular.forEach(arrayFolders, function(item) {
      var data = "name="+item.name;
      data = path!='owner' ? "name="+item.name+"&path="+path: data;
      console.log(data);
      var deferredItemList = $q.defer();
      $http.put(domainENT+'/workspace/folder/copy/'+item._id, data).then(function(resp) {
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

  this.copySelectedDocs = function(arrayDocs, folderName){
    console.log(arrayDocs)
    var promises = []
    var deferredCombinedItems = $q.defer()
    var combinedItems = []
    folderName = folderName == 'owner' ? '' : '/'+folderName

    angular.forEach(arrayDocs, function(item) {
      var deferredItemList = $q.defer();
      $http.post(domainENT+'/workspace/documents/copy/'+item._id+folderName).then(function(resp) {
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

  this.deleteSelectedDocuments = function(arrayDocs, isMyDocuments){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];

    angular.forEach(arrayDocs, function(item) {
      var request = isMyDocuments ? $http.put(domainENT+'/workspace/document/trash/'+item._id) : $http.delete(domainENT+'/workspace/document/'+item._id)
      var deferredItemList = $q.defer();
      request.then(function(resp) {
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

  this.deleteSelectedFolders = function(arrayFolders, isMyDocuments){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];

    angular.forEach(arrayFolders, function(item) {
      var request = isMyDocuments ? $http.put(domainENT+'/workspace/folder/trash/'+item._id) : $http.delete(domainENT+'/workspace/folder/'+item._id)

      var deferredItemList = $q.defer();
      request.then(function(resp) {
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

  this.restoreSelectedDocuments = function(arrayDocs){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    angular.forEach(arrayDocs, function(item) {
      var deferredItemList = $q.defer();
      $http.put(domainENT+'/workspace/restore/document/'+item._id).then(function(resp) {
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

  this.restoreSelectedFolders = function(arrayFolders){
    var promises = [];
    var deferredCombinedItems = $q.defer();
    var combinedItems = [];
    angular.forEach(arrayFolders, function(item) {
      var deferredItemList = $q.defer();
      $http.put(domainENT+'/workspace/folder/restore/'+item._id).then(function(resp) {
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

  this.getTranslation = function(){
    return $http.get(domainENT+"/workspace/i18n");
  }

  var parametersUrl = function(filter, hierarchical){
    var entFilter = filter=="appDocuments" ? "protected":filter;
    return params = hierarchical ? entFilter+'&hierarchical=true&_='+getTimeInMillis():entFilter+'&_='+getTimeInMillis();
  }

  var getTimeInMillis = function(){
    var d = new Date();
    var n = d.getTime();
    return n;
  }
})

.factory("CreateNewFolderPopUpFactory", function($ionicPopup, $rootScope){
  function getPopup(scope){
    scope.createdFolder={}
    return $ionicPopup.show({
      template: '<input type="text" ng-model="createdFolder.name">',
      title: $rootScope.translationWorkspace["folder.new.title"],
      subtitle: $rootScope.translationWorkspace["folder.new"],
      scope: scope,
      buttons: [
        { text: $rootScope.translationWorkspace["cancel"] },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!scope.createdFolder.name) {
              e.preventDefault();
            } else {
              return scope.createdFolder.name;
            }
          }
        }
      ]
    });
  }
  return {
    getPopup: getPopup
  };
})

.factory("RenamePopUpFactory", function($ionicPopup, $rootScope){

  function getPopup(scope, model){
    scope.item = model
    return $ionicPopup.show({
      template: '<input type="text" ng-model="item.name">',
      title: $rootScope.translationWorkspace["workspace.rename"],
      scope: scope,
      buttons: [
        { text: $rootScope.translationWorkspace["cancel"] },
        {
          text: '<b>'+$rootScope.translationWorkspace["workspace.rename"]+'</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!scope.item.name) {
              e.preventDefault();
            } else {
              return scope.item.name;
            }
          }
        }
      ]
    })
  }
  return {
    getPopup: getPopup
  };

})
.factory("VersionsDocPopupFactory", function ($ionicPopup, $rootScope) {

  function getPopup() {
    return $ionicPopup.confirm({
      title: $rootScope.translationWorkspace["workspace.delete"],
      template: 'Êtes-vous sûr(e) de vouloir supprimer ce document ?'
    })
  }
  return {
    getPopup: getPopup
  };
})

.factory("MovingItemsFactory", function(){
    var foldersToMove = []
    var docsToMove = []

    return {
           getMovingFolders: function () {
               return foldersToMove;
           },
           getMovingDocs: function () {
               return docsToMove;
           },
           setMovingFolders: function (movingFolders) {
               foldersToMove = movingFolders;
           },
           setMovingDocs: function (movingDocs) {
               docsToMove = movingDocs;
           }
       };

})

.factory("MimeTypeFactory", function($rootScope){

  function getThumbnailByMimeType(mimeType){
    var thumbnail = "unknown-large.png";
    for(var i=0; i< mimeTypesArray.length; i++){
      if(mimeTypesArray[i].mimetypes.indexOf(mimeType)!=-1){
        thumbnail = mimeTypesArray[i].thumbnail;
      }
    }
    return thumbnail;
  }

  function setIcons(doc){
    var test;
    if(doc.hasOwnProperty('thumbnails')){
      var dimensions='';
      switch (Object.keys(doc.thumbnails).length) {
        case 1:
          dimensions="120x120"
          break;
        case 2:
            dimensions="290x290"
            break;
            default:
              break;
      }
      doc.icon_image = "/workspace/document/"+doc._id+"?thumbnail="+dimensions
      doc.image = "/workspace/document/"+doc._id
      test = "false";
    } else {
            test = "true";
            doc.icon_image = "img/"+getThumbnailByMimeType(doc.metadata["content-type"])
    }
    doc.test = test;
    return doc;
  }

        return {
          getThumbnailByMimeType: getThumbnailByMimeType,
          setIcons: setIcons,
        };
      })

      var mimeTypesArray = [{

        "thumbnail": "word.png",
        // "thumbnail": "img/word.png",
        "mimetypes": [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
          "application/vnd.ms-word.document.macroEnabled.12",
          "application/vnd.ms-word.template.macroEnabled.12"
        ]
      },
      {
        "thumbnail": "excel.png",
        // "thumbnail": "img/excel.png",
        "mimetypes": [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
          "application/vnd.ms-excel.sheet.macroEnabled.12",
          "application/vnd.ms-excel.addin.macroEnabled.12",
          "application/vnd.ms-excel.sheet.binary.macroEnabled.12"
        ]
      },
      {
        // "thumbnail": "img/word.png",
        "thumbnail": "powerpoint.png",
        "mimetypes": [
          "application/vnd.ms-powerpoint",
          "application/vnd.ms-powerpoint",
          "application/vnd.ms-powerpoint",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.openxmlformats-officedocument.presentationml.template",
          "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
          "application/vnd.ms-powerpoint.addin.macroEnabled.12",
          "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
          "application/vnd.ms-powerpoint.template.macroEnabled.12",
          "application/vnd.ms-powerpoint.slideshow.macroEnabled.12"
        ]
      },
      {
        // "thumbnail": "img/pdf.png",
        "thumbnail": "pdf.png",
        "mimetypes": [
          "application/pdf"
        ]
      },
      {
        "thumbnail": "audio.png",
        // "thumbnail": "img/audio.png",
        "mimetypes": [
          "audio/mpeg",
          "audio/x-ms-wma",
          "audio/vnd.rn-realaudio",
          "audio/x-wav",
          "audio/mp3"
        ]
      }
    ]
