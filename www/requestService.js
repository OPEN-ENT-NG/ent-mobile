angular.module('ent.request', ['ent.workspace_service', 'ent'])

.service('RequestService', function($http, $q, $state, $ionicLoading) {

    this.get = function (url, config) {
      return $q(function(resolve, reject){
        $http.get(url, config).then(function (response) {
          var str = response.data.toString();
          if(str.startsWith("<!doctype html>"))
          {
            $ionicLoading.hide();
            $state.go('login');
          }
          else
            resolve(response)
        })
      })
    }

    this.delete = function (url, config) {
      return $q(function(resolve, reject){
        $http.delete(url, config).then(function (response) {
          var str = response.data.toString();
          if(str.startsWith("<!doctype html>"))
          {
            $ionicLoading.hide();
            $state.go('login');
          }
          else
            resolve(response)
        })
      })
    }

    this.put = function (url, data, config) {
      return $q(function(resolve, reject){
        $http.put(url, data, config).then(function (response) {
          var str = response.data.toString();
          if(str.startsWith("<!doctype html>"))
          {
            $ionicLoading.hide();
            $state.go('login');
          }
          else
            resolve(response)
        })
      })
    }

    this.post = function (url, data, config) {
      return $q(function(resolve, reject){
        $http.post(url, data, config).then(function (response) {
          var str = response.data.toString();
          if(str.startsWith("<!doctype html>"))
          {
            $ionicLoading.hide();
            $state.go('login');
          }
          else
            resolve(response)
        })
      })
    }
});
