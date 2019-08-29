angular
  .module("ent.request", ["ent.workspace_service", "ent"])

  .service("RequestService", function($http, $q, $state, $ionicLoading) {
    var timeout = 30000;

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

    this.setDefaultAuth = function(tokens) {
      $http.defaults.headers.common["Authorization"] =
        "Bearer " + tokens.access;
      return tokens;
    };

    this.get = function(url, config) {
      return $q(function(resolve, reject) {
        $http
          .get(url, { timeout, ...config })
          .then(response => {
            onResolve(resolve, response);
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };

    this.delete = function(url, data, config) {
      return $q(function(resolve, reject) {
        $http
          .delete(url, { timeout, data, ...config })
          .then(response => {
            onResolve(resolve, response);
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };

    this.put = function(url, data, config) {
      return $q(function(resolve, reject) {
        $http
          .put(url, data, { timeout, ...config })
          .then(response => {
            onResolve(resolve, response);
          })
          .catch(err => {
            onError(reject, err);
          });
      });
    };

    this.post = function(url, data, config, avoidRedirect) {
      return $q(function(resolve, reject) {
        $http
          .post(url, data, { timeout, ...config })
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
