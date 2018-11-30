angular
  .module("ent.request", ["ent.workspace_service", "ent"])

  .service("RequestService", function(
    $timeout,
    $http,
    $q,
    $state,
    $ionicLoading
  ) {
    var timeout = 5000;

    function onError(reject, error) {
      $ionicLoading.hide();
      reject(error);
    }

    function onResolve(resolve, response) {
      var str = response.data.toString();
      if (str.startsWith("<!doctype html>")) {
        $ionicLoading.hide();
        resolve(response);
        $state.go("login");
      } else {
        resolve(response);
      }
    }

    function getConfig(config = {}) {
      config.timeout = config.timeout || timeout;
      config.headers = Object.assign(
        config.headers || {},
        $http.defaults.headers.common
      );
      return config;
    }

    this.setDefaultHeaders = function() {
      $http.defaults.headers.common["Content-Type"] =
        "application/x-www-form-urlencoded; charset=UTF-8";
      $http.defaults.headers.common["Accept"] =
        "application/json;charset=UTF-8";
    };

    this.setDefaultAuth = function(tokens) {
      $http.defaults.headers.common["Authorization"] =
        "Bearer " + tokens.access;
      return tokens;
    };

    this.get = function(url, config) {
      config = getConfig(config);
      return $q(function(resolve, reject) {
        $http.get(url, config).then(
          function(response) {
            onResolve(resolve, response);
          },
          function(err) {
            onError(reject, err);
          }
        );
      });
    };

    this.delete = function(url, config) {
      config = getConfig(config);
      return $q(function(resolve, reject) {
        $http.delete(url, config).then(
          function(response) {
            onResolve(resolve, response);
          },
          function(err) {
            onError(reject, err);
          }
        );
      });
    };

    this.put = function(url, data, config) {
      config = getConfig(config);
      return $q(function(resolve, reject) {
        $http.put(url, data, config).then(
          function(response) {
            onResolve(resolve, response);
          },
          function(err) {
            onError(reject, err);
          }
        );
      });
    };

    this.post = function(url, data, config) {
      config = getConfig(config);
      return $q(function(resolve, reject) {
        $http.post(url, data, config).then(
          function(response) {
            onResolve(resolve, response);
          },
          function(err) {
            onError(reject, err);
          }
        );
      });
    };
  });
