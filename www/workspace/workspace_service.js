angular
  .module("ent.workspace_service", ["ent.request"])

  .service("WorkspaceService", function($http, domainENT, RequestService) {
    this.getFolders = function(parameters) {
      return getDocuments(parameters, true);
    };

    this.getFiles = function(parameters) {
      return getDocuments(parameters, false);
    };

    var getDocuments = function(parameters, isFolder) {
      let urlParameters = "";
      for (let key in parameters) {
        urlParameters += parameters[key] ? `${key}=${parameters[key]}&` : "";
      }
      urlParameters = urlParameters.substring(0, urlParameters.length - 1);

      let foldersOrFiles = isFolder ? "/folders/list" : "/documents";

      return RequestService.get(
        `${domainENT}/workspace${foldersOrFiles}?${urlParameters}`
      );
    };

    this.updateSharingActions = function(id, data) {
      return RequestService.put(
        `${domainENT}/workspace/share/resource/${id}`,
        data
      );
    };

    this.commentDocById = function(id, comment) {
      return RequestService.post(
        domainENT + "/workspace/document/" + id + "/comment",
        "comment=" + comment
      );
    };

    this.renameDocument = function(item, newName) {
      let folder = item.eType === "folder" ? "/folder" : "";
      return RequestService.put(
        `${domainENT}/workspace${folder}/rename/${item._id}`,
        { name: newName }
      );
    };

    this.trashDocuments = function(ids) {
      return RequestService.put(`${domainENT}/workspace/documents/trash`, {
        ids
      });
    };

    this.deleteDocuments = function(ids) {
      return RequestService.delete(`${domainENT}/workspace/documents`, {
        ids
      });
    };

    this.restoreDocuments = function(ids) {
      return RequestService.put(`${domainENT}/workspace/documents/restore`, {
        ids
      });
    };

    this.getSharingItemDatas = function(idItem, search = "") {
      return RequestService.get(
        `${domainENT}/workspace/share/json/${idItem}?search=${search}`
      );
    };

    // this.versionDoc = function(id) {
    //   return RequestService.get(
    //     domainENT + "/workspace/document/" + id + "/revisions"
    //   );
    // };

    // this.putNewVersion = function(id, newVersion) {
    //   return $http.put(
    //     domainENT +
    //       "/workspace/document/" +
    //       id +
    //       "?thumbnail=120x120&thumbnail=290x290",
    //     newVersion,
    //     {
    //       transformRequest: angular.identity,
    //       headers: { "Content-Type": undefined }
    //     }
    //   );
    // };

    // this.deleteVersion = function(idDoc, idVersion) {
    //   return RequestService.delete(
    //     domainENT + "/workspace/document/" + idDoc + "/revision/" + idVersion
    //   );
    // };

    this.uploadDoc = function(doc, parentId) {
      let parentIdParam = parentId ? `&parentId=${parentId}` : "";
      return $http.post(
        `${domainENT}/workspace/document?thumbnail=120x120&thumbnail=290x290&quality=0.8${parentIdParam}`,
        doc,
        {
          transformRequest: angular.identity,
          headers: { "Content-Type": undefined }
        }
      );
    };

    this.moveDocuments = function(ids, targetId) {
      return RequestService.put(
        `${domainENT}/workspace/documents/move/${targetId}`,
        { ids }
      );
    };

    this.copyDocuments = function(ids, targetId) {
      return RequestService.post(
        `${domainENT}/workspace/documents/copy/${targetId}`,
        { ids }
      );
    };

    this.createFolder = function(name, parentId) {
      let data = `name=${name}` + (parentId ? `parentId=${parentId}` : "");
      return RequestService.post(`${domainENT}/workspace/folder?`, data);
    };

    this.getTranslation = function() {
      return RequestService.get(domainENT + "/workspace/i18n");
    };
  })

  .service("WorkspaceHelper", function() {
    this.getCheckedItems = function() {
      return getChecked(getCollection(arguments));
    };

    this.getCheckedItemsId = function() {
      return getChecked(getCollection(arguments), "_id");
    };

    function getCollection(collections) {
      let finalCollection = [];
      for (let collection of collections) {
        if (collection) {
          finalCollection = [...collection, ...finalCollection];
        }
      }
      return finalCollection;
    }

    function getChecked(collection, key) {
      var checked = [];
      for (var i = 0; i < collection.length; i++) {
        if (collection[i].checked) {
          checked.push(
            key && collection[i].hasOwnProperty(key)
              ? collection[i][key]
              : collection[i]
          );
        }
      }
      return checked;
    }

    // function setUnchecked(array) {
    //   for (var i = 0; i < array.length; i++) {
    //     if (array[i].checked) {
    //       array[i].checked = false;
    //     }
    //   }
    //   return array;
    // }
  })

  .factory("CreateNewFolderPopUpFactory", function(
    WorkspaceService,
    $ionicPopup,
    $rootScope
  ) {
    function getPopup(scope) {
      scope.data = {};
      return $ionicPopup.show({
        template: '<input type="text" ng-model="data.name">',
        title: $rootScope.translationWorkspace["folder.new.title"],
        subtitle: $rootScope.translationWorkspace["folder.new"],
        scope,
        buttons: [
          { text: $rootScope.translationWorkspace["cancel"] },
          {
            text: "<b>OK</b>",
            type: "button-positive",
            onTap: function(e) {
              if (!scope.data.name) {
                e.preventDefault();
              } else {
                return scope.data.name;
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

  .factory("RenamePopUpFactory", function($ionicPopup, $rootScope) {
    function getPopup(scope, model) {
      scope.item = model;
      return $ionicPopup.show({
        template: '<input type="text" ng-model="item.name">',
        title: $rootScope.translationWorkspace["workspace.rename"],
        scope: scope,
        buttons: [
          { text: $rootScope.translationWorkspace["cancel"] },
          {
            text:
              "<b>" +
              $rootScope.translationWorkspace["workspace.rename"] +
              "</b>",
            type: "button-positive",
            onTap: function(e) {
              if (!scope.item.name) {
                e.preventDefault();
              } else {
                return scope.item.name;
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

  // .factory("VersionsDocPopupFactory", function($ionicPopup, $rootScope) {
  //   function getPopup() {
  //     return $ionicPopup.confirm({
  //       title: $rootScope.translationWorkspace["workspace.delete"],
  //       template: "Êtes-vous sûr(e) de vouloir supprimer ce document ?"
  //     });
  //   }
  //   return {
  //     getPopup: getPopup
  //   };
  // })

  // .factory("MovingItemsFactory", function() {
  //   var foldersToMove = [];
  //   var docsToMove = [];

  //   return {
  //     getMovingFolders: function() {
  //       return foldersToMove;
  //     },
  //     getMovingDocs: function() {
  //       return docsToMove;
  //     },
  //     setMovingFolders: function(movingFolders) {
  //       foldersToMove = movingFolders;
  //     },
  //     setMovingDocs: function(movingDocs) {
  //       docsToMove = movingDocs;
  //     }
  //   };
  // })

  .factory("MimeTypeFactory", function($rootScope) {
    function getThumbnailByMimeType(mimeType) {
      var thumbnail = "unknown-large.png";
      for (var i = 0; i < mimeTypesArray.length; i++) {
        if (mimeTypesArray[i].mimetypes.indexOf(mimeType) != -1) {
          thumbnail = mimeTypesArray[i].thumbnail;
        }
      }
      return thumbnail;
    }

    function setIcons(doc) {
      var test;
      if (doc.hasOwnProperty("thumbnails")) {
        var dimensions = "";
        switch (Object.keys(doc.thumbnails).length) {
          case 1:
            dimensions = "120x120";
            break;
          case 2:
            dimensions = "290x290";
            break;
          default:
            break;
        }
        doc.icon_image =
          "/workspace/document/" + doc._id + "?thumbnail=" + dimensions;
        doc.image = "/workspace/document/" + doc._id;
        test = "false";
      } else {
        test = "true";
        doc.icon_image =
          "img/" + getThumbnailByMimeType(doc.metadata["content-type"]);
      }
      doc.test = test;
      return doc;
    }

    return {
      getThumbnailByMimeType: getThumbnailByMimeType,
      setIcons: setIcons
    };
  });

var mimeTypesArray = [
  {
    thumbnail: "word.png",
    // "thumbnail": "img/word.png",
    mimetypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
      "application/vnd.ms-word.document.macroEnabled.12",
      "application/vnd.ms-word.template.macroEnabled.12"
    ]
  },
  {
    thumbnail: "excel.png",
    // "thumbnail": "img/excel.png",
    mimetypes: [
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
    thumbnail: "powerpoint.png",
    mimetypes: [
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
    thumbnail: "pdf.png",
    mimetypes: ["application/pdf"]
  },
  {
    thumbnail: "audio.png",
    // "thumbnail": "img/audio.png",
    mimetypes: [
      "audio/mpeg",
      "audio/x-ms-wma",
      "audio/vnd.rn-realaudio",
      "audio/x-wav",
      "audio/mp3"
    ]
  }
];
