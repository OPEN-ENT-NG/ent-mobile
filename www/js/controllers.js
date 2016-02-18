angular.module('ent.controllers', [])

.service('UserInfoService', function($http, domainENT){
  this.getUserData = function (userId) {
    return $http.get(domainENT+"/userbook/api/person?id="+userId);
  }

  this.getOAuthInfo = function (){
    return $http.get(domainENT+'/auth/oauth2/userinfo');
  }
})

.controller('UserInfoCtrl', function($scope, domainENT,UserInfoService) {
  UserInfoService.getOAuthInfo().then(function(resp) {
    $scope.userinfo = resp.data;
  }, function(err) {
    alert('ERR', err.data.status);

  });
})

.controller('AppCtrl', function($scope, $sce, $state, $cordovaInAppBrowser, $cordovaFileTransfer,$cordovaProgress, $cordovaFileOpener2, domainENT, UserInfoService, $ionicHistory){

  $scope.renderHtml = function(text){
    if(text != null){
      text = text.replace(/="\/\//g, "=\"https://");
      text = text.replace(/="\//g, "=\""+domainENT+"/");

      //pb dans le cas de téléchargement de fichiers
      // var newString = text.replace(/href="([\S]+)"/g, "onClick=window.plugins.fileOpener.open(\"$1\")")
      var newString = text.replace(/href="([\S]+)"/g, "onClick=\"window.open('$1', '_blank', 'location=no')\"");

      // console.log(newString);
      return $sce.trustAsHtml(newString);
    }
  }

  $scope.downloadFile = function (filename, urlFile, fileMIMEType){
    // Save location
    console.log("downloadFile");
    var url = $sce.trustAsResourceUrl(urlFile);
    var targetPath = cordova.file.externalRootDirectory + filename; //revoir selon la platforme

    $cordovaProgress.showSimpleWithLabelDetail(true, "Téléchargement en cours", filename);
    $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
      $cordovaProgress.hide();
      $scope.openLocalFile(targetPath, fileMIMEType);

    }, function (error) {
      alert('Error');
    }, function (progress) {
    });
  }

  $scope.openLocalFile = function (targetPath, fileMIMEType){

    $cordovaFileOpener2.open(
      targetPath,
      fileMIMEType,
      {
        error : function(){ alert("nope") },
        success : function(){ }
      }
    );
  }

  $scope.getImageUrl= function(path){
    if(path!=null && path!= ""){
      return domainENT+path;
    }
  }

  function getAvatarImage (userId){
    UserInfoService.getUserData(userId).then(function(resp){
      console.log(domainENT+resp.data.result[0].photo);
      return domainENT+resp.data.result[0].photo;
    }), function(err){
      alert('ERR:'+ err);
    }
  }

  $scope.logout = function(){
    localStorage.clear();
    $ionicHistory.clearHistory()
    $state.go("login");
    window.cookies.clear(function() {
      console.log('Cookies cleared!');
    });
    // ionic.Platform.exitApp(); // stops the app
  }
})

.directive('appVersion', function () {
  return function(scope, elm, attrs) {
    cordova.getAppVersion(function (version) {
      elm.text(version);
    });
  };
})

function findElementById(arraytosearch, valuetosearch) {
  console.log("arraytosearch "+arraytosearch);
  console.log("valuetosearch "+valuetosearch);

  for (var i = 0; i < arraytosearch.length; i++) {
    if (arraytosearch[i].id == valuetosearch) {
      return arraytosearch[i];
    }
  }
  return null;
}
