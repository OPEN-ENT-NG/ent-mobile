angular
  .module("ent.request", ["ent.workspace_service", "ent"])

  .service("RequestService", function (
    $ionicPlatform,
    $q,
    $state,
    $ionicLoading
  ) {
    $ionicPlatform.ready(() => {
      cordova.plugin.http.setRequestTimeout(30);
      cordova.plugin.http.setDataSerializer("json");
    });

    const usableMethod = {
      GET: "get",
      POST: "post",
      PUT: "put",
      UPLOAD: "upload",
      DOWNLOAD: "download",
      DELETE: "delete",
    };

    const methodWithData = [
      usableMethod.POST,
      usableMethod.PUT,
      usableMethod.DOWNLOAD,
      usableMethod.UPLOAD,
      usableMethod.DELETE,
    ];

    const methodWithFile = [usableMethod.UPLOAD, usableMethod.DOWNLOAD];

    function getOptions({ method, data, config, params, name, filePath }) {
      return $q(function (resolve, reject) {
        const result = { method };
        const initConfig = config || {};

        if (!Object.values(usableMethod).includes(method))
          return reject("Unsupported method");

        if (methodWithFile.includes(method)) {
          if (filePath == null) {
            return reject(
              "Provide a filePath for the file in order to use the upload or download method"
            );
          } else {
            result["filePath"] = filePath;
          }

          if (method == usableMethod.UPLOAD && name == null) {
            return reject(
              "Provide a filePath for the file in order to use the upload or download method"
            );
          } else {
            result["name"] = name;
          }
        }

        if (methodWithData.includes(method)) {
          result["data"] = data || {};
        }

        if (params != null) result["params"] = params || {};

        result["responseType"] = initConfig.hasOwnProperty("responseType")
          ? initConfig.responseType
          : "JSON";

        return resolve(spreadObject(result, initConfig));
      });
    }

    function onError(reject, error) {
      $ionicLoading.hide();
      reject(error);
    }

    function onResolve(resolve, response) {
      var str = response.data.toString();
      if (str.startsWith("<!doctype html>")) {
        $ionicLoading.hide();
        if (!$state.is("login")) {
          $state.go("login", { prefill: true });
        }
      } else {
        resolve(response);
      }
    }

    function makeRequest(url, options, avoidRedirect) {
      return $q(function (resolve, reject) {
        cordova.plugin.http.sendRequest(
          url,
          options,
          (response) => {
            if (avoidRedirect) {
              resolve(response);
            } else {
              onResolve(resolve, response);
            }
          },
          (err) => onError(reject, err)
        );
      });
    }

    this.setDefaultAuth = (tokens) => {
      cordova.plugin.http.setHeader("Authorization", "Bearer " + tokens.access);
      return tokens;
    };

    this.get = function (url, params, config) {
      return getOptions({ method: "get", params, config }).then((options) =>
        makeRequest(url, options, false)
      );
    };

    this.delete = function (url, params, data, config) {
      return getOptions({
        method: "delete",
        params,
        data,
        config,
      }).then((options) => makeRequest(url, options, false));
    };

    this.put = function (url, params, data, config) {
      return getOptions({
        method: "put",
        params,
        data,
        config,
      }).then((options) => makeRequest(url, options, false));
    };

    this.post = function (url, params, data, config, avoidRedirect) {
      return getOptions({
        method: "post",
        params,
        data,
        config,
      }).then((options) => makeRequest(url, options, avoidRedirect));
    };

    //TODO
    // this.downloadFile = function (url, params, config, filePath) {
    //   return getOptions({
    //     method: "download",
    //     params,
    //     config,
    //     filePath,
    //   }).then((options) => makeRequest(url, options, false));
    // };

    //TODO Input tag doesn't provide the path
    // this.uploadFile = function (url, params, config, filePath, name) {
    //   return getOptions({
    //     method: "upload",
    //     params,
    //     config,
    //     filePath,
    //     name,
    //   }).then((options) => makeRequest(url, options, false));
    // };
  });
