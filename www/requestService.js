angular
  .module("ent.request", ["ent.workspace_service", "ent"])

  .service("RequestService", function(
    $rootScope,
    $http,
    $q,
    $state,
    $ionicLoading
  ) {
    var timeout = 30000;
    var headers = {
      Authorization: "",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    };

    function getConfig(config = {}) {
      const newHeaders = spreadObject(headers, config.headers || {});
      return spreadObject({ timeout }, config, {
        headers: newHeaders
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

    this.setDefaultAuth = tokens => {
      headers["Authorization"] = "Bearer " + tokens.access;
      return tokens;
    };

    this.get = function(url, config) {
      config = getConfig(config);
      return $q(function(resolve, reject) {
        $http
          .get(url, config)
          .then(response => {
            onResolve(resolve, response);
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };

    this.delete = function(url, data, config) {
      config = getConfig(config);

      return $q(function(resolve, reject) {
        $http
          .delete(url, spreadObject(config, { data }))
          .then(response => {
            onResolve(resolve, response);
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };

    this.put = function(url, data, config) {
      config = getConfig(config);

      return $q(function(resolve, reject) {
        $http
          .put(url, data, config)
          .then(response => {
            onResolve(resolve, response);
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };

    this.post = function(url, data, config, avoidRedirect) {
      config = getConfig(config);

      return $q(function(resolve, reject) {
        $http
          .post(url, data, config)
          .then(response => {
            if (avoidRedirect) {
              resolve(response);
            } else {
              onResolve(resolve, response);
            }
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };
  });
