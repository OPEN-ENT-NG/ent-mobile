angular
  .module("ent.fileService", [])
  .service("FileService", function (
    RequestService,
    PopupFactory,
    $q,
    $sce,
    $cordovaFile,
    $cordovaFileOpener2,
    $ionicLoading,
    $ionicPlatform,
    $rootScope
  ) {
    var downloadedFilePath = "";

    $ionicPlatform.ready(function () {
      downloadedFilePath = ionic.Platform.isIOS()
        ? cordova.file.dataDirectory
        : cordova.file.externalRootDirectory + "Download/";
    });

    this.isFileTooBig = (file) => {
      const maxFileSize = 104857600;
      return $rootScope.translationWorkspace &&
        $rootScope.translationWorkspace.hasOwnProperty("max.file.size")
        ? file.size > $rootScope.translationWorkspace["max.file.size"]
        : file.size > maxFileSize;
    };

    this.getFileSize = function (bytes) {
      const isSizeNumber = !isNaN(parseFloat(bytes));
      const isSizeFinite = isFinite(bytes);
      if (isSizeNumber || isSizeFinite) {
        const units = ["bytes", "kB", "MB", "GB", "TB", "PB"];
        const number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (
          (bytes / Math.pow(1024, Math.floor(number))).toFixed(1) +
          " " +
          units[number]
        );
      } else {
        return "-";
      }
    };

    const checkPermission = () => {
      return $q((resolve, reject) => {
        if (ionic.Platform.isIOS()) {
          resolve();
        } else if (ionic.Platform.isAndroid()) {
          cordova.plugins.diagnostic.isExternalStorageAuthorized((bool) => {
            if (bool) {
              resolve();
            } else {
              cordova.plugins.diagnostic.requestExternalStorageAuthorization(
                (result) => {
                  if (
                    result ==
                    cordova.plugins.diagnostic.permissionStatus.GRANTED
                  ) {
                    resolve();
                  } else {
                    reject();
                  }
                }
              );
            }
          });
        } else {
          reject();
        }
      });
    };

    const checkFile = function (fileName) {
      return $cordovaFile
        .checkFile(downloadedFilePath, fileName)
        .catch((err) => {
          if (err.code === 1) {
            return $q.resolve(null);
          } else {
            return $q.reject(err);
          }
        });
    };

    const downloadFile = function (fileUrl, fileName) {
      const config = {
        responseType: "arraybuffer",
        cache: "true",
      };
      const url = $sce.getTrustedResourceUrl($sce.trustAsResourceUrl(fileUrl));

      return RequestService.get(url, null, config).then((result) => {
        if (result.status < 300 && result.status >= 200 && !!result.data) {
          return formatFile(fileName, result);
        } else {
          return $q.reject(result.data);
        }
      });
    };

    this.uploadFile = function (url, params, file) {
      var formData = new FormData();
      formData.append("file", file);
      return RequestService.post(url, params, file, {
        transformRequest: angular.identity,
        headers: { "Content-Type": "multipart/form-data" },
        serializer: "multipart",
      });
    };

    const formatFile = function (fileName, fileRequest) {
      const fileData = fileRequest.data;
      const contentType = fileRequest.headers["content-type"];

      const getLocalFile = function (fileName) {
        return $cordovaFile
          .readAsText(cordova.file.applicationDirectory + "www/", fileName)
          .then(function (fileAsText) {
            return JSON.parse(fileAsText);
          });
      };

      return getLocalFile("mimeTypes.json")
        .then(function (mimeTypeMap) {
          const getMimeType = function () {
            if (contentType != null) {
              return contentType;
            } else {
              return "application/octet-stream";
            }
          };

          const getExtension = function (mimeType) {
            const mapHasMimeType = mimeTypeMap.hasOwnProperty(mimeType);
            if (mapHasMimeType) {
              return mimeTypeMap[mimeType];
            } else {
              return "";
            }
          };

          const getFileName = function (mimeType) {
            const fileExtensionRegexp = /\.[a-z0-9]+$/g;
            const fileHasExtension = fileExtensionRegexp.test(fileName);
            if (fileHasExtension) {
              return fileName;
            } else {
              return fileName + getExtension(mimeType);
            }
          };

          const getFileData = function (mimeType) {
            return new Blob([new Uint8Array(fileData)], {
              type: mimeType,
            });
          };

          const mimeType = getMimeType();
          return {
            fileName: getFileName(mimeType),
            fileData: getFileData(mimeType),
          };
        })
        .catch(function () {
          return $q.reject("Failed to get mimetype map");
        });
    };

    const writeFile = function (fileName, fileData) {
      return $cordovaFile
        .writeFile(downloadedFilePath, fileName, fileData, true)
        .then(() => fileName);
    };

    const openFile = (fileEntry) => {
      return $cordovaFileOpener2
        .open(fileEntry.toURL(), fileEntry.type)
        .catch((err) => {
          console.log("Fail to open file", err);
          PopupFactory.getAlertPopupNoTitle("Fichier téléchargé avec succès !");
        });
    };

    this.getFile = function (fileName, fileUrl) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      checkPermission()
        .then(function () {
          return checkFile(fileName);
        })
        .then(function (fileEntry) {
          if (!!fileEntry) {
            return fileEntry;
          } else {
            return downloadFile(fileUrl, fileName)
              .then(function (result) {
                return writeFile(result.fileName, result.fileData);
              })
              .then(checkFile);
          }
        })
        .then(openFile)
        .catch(PopupFactory.getCommonAlertPopup)
        .finally($ionicLoading.hide);
    };
  });
