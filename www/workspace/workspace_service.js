angular
  .module("ent.workspace_service", ["ent.request"])

  .service("WorkspaceService", function (
    domainENT,
    FileService,
    RequestService,
    $q
  ) {
    function cleanNullParameters(parameters) {
      return Object.fromEntries(
        Object.entries(parameters).filter((item) => item[1] != null)
      );
    }

    this.getFolders = function (parameters) {
      return getDocuments(cleanNullParameters(parameters), true);
    };

    this.getFiles = function (parameters) {
      return getDocuments(cleanNullParameters(parameters), false);
    };

    var getDocuments = function (parameters, isFolder) {
      const url = isFolder
        ? `${domainENT}/workspace/folders/list`
        : `${domainENT}/workspace/documents`;
      return RequestService.get(url, parameters);
    };

    this.updateSharingActions = function (id, data) {
      return RequestService.put(
        `${domainENT}/workspace/share/resource/${id}`,
        null,
        data
      );
    };

    this.commentDocById = function (id, comment) {
      return RequestService.post(
        `${domainENT}/workspace/document/${id}/comment`,
        null,
        { comment, serializer: "urlencoded" }
      );
    };

    this.renameDocument = function (item, newName) {
      const url =
        item.eType === "folder"
          ? `${domainENT}/workspace/folder/rename/${item._id}`
          : `${domainENT}/workspace/rename/${item._id}`;
      return RequestService.put(url, null, { name: newName });
    };

    this.trashDocuments = function (ids) {
      return RequestService.put(
        `${domainENT}/workspace/documents/trash`,
        null,
        {
          ids,
        }
      );
    };

    this.deleteDocuments = function (ids) {
      return $q.all(
        ids.map(function (id) {
          return RequestService.delete(`${domainENT}/workspace/document/${id}`);
        })
      );
    };

    this.restoreDocuments = function (ids) {
      return RequestService.put(
        `${domainENT}/workspace/documents/restore`,
        null,
        {
          ids,
        }
      );
    };

    this.getSharingItemDatas = function (idItem, search = "") {
      const params = { search };
      return RequestService.get(
        `${domainENT}/workspace/share/json/${idItem}`,
        params
      );
    };

    this.uploadDoc = function (doc, parentId) {
      const params = {
        thumbnail: ["100x100", "120x120", "290x290", "381x381", "1600x0"],
        quality: "1",
      };
      if (!!parentId) {
        params["parentId"] = parentId;
      }
      return FileService.uploadFile(
        `${domainENT}/workspace/document`,
        params,
        doc
      );
    };

    this.uploadAttachment = function (doc) {
      const params = {
        protected: "true",
        application: "media-library",
      };
      return FileService.uploadFile(
        `${domainENT}/workspace/document`,
        params,
        doc
      );
    };

    this.moveDocuments = function (ids, targetId) {
      return RequestService.put(
        `${domainENT}/workspace/documents/move/${targetId}`,
        null,
        { ids }
      );
    };

    this.copyDocuments = function (ids, targetId) {
      return RequestService.post(
        `${domainENT}/workspace/documents/copy/${targetId}`,
        null,
        { ids }
      );
    };

    this.createFolder = function (name, parentFolderId) {
      const params = { name };
      if (!!parentFolderId) {
        params["parentFolderId"] = parentFolderId;
      }
      return RequestService.post(`${domainENT}/workspace/folder`, null, params);
    };

    this.getTranslation = function () {
      return RequestService.get(domainENT + "/workspace/i18n");
    };
  })

  .service("WorkspaceHelper", function () {
    this.getCheckedItems = function () {
      return getChecked(getCollection(arguments));
    };

    this.getCheckedItemsId = function () {
      return getChecked(getCollection(arguments), "_id");
    };

    function getCollection(collections) {
      let finalCollection = [];
      for (let collection of collections) {
        if (collection) {
          finalCollection = spreadArray(collection, finalCollection);
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
  })

  .factory("MimeTypeFactory", function () {
    var mimeTypesArray = [
      {
        thumbnail: "word.png",
        mimetypes: [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
          "application/vnd.ms-word.document.macroEnabled.12",
          "application/vnd.ms-word.template.macroEnabled.12",
        ],
      },
      {
        thumbnail: "excel.png",
        mimetypes: [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
          "application/vnd.ms-excel.sheet.macroEnabled.12",
          "application/vnd.ms-excel.addin.macroEnabled.12",
          "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
        ],
      },
      {
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
          "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
        ],
      },
      {
        thumbnail: "pdf.png",
        mimetypes: ["application/pdf"],
      },
      {
        thumbnail: "audio.png",
        mimetypes: [
          "audio/mpeg",
          "audio/x-ms-wma",
          "audio/vnd.rn-realaudio",
          "audio/x-wav",
          "audio/mp3",
        ],
      },
    ];

    function getThumbnailByMimeType(mimeType) {
      var thumbnail = "defaultfile.png";
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
      getThumbnailByMimeType,
      setIcons,
    };
  });
