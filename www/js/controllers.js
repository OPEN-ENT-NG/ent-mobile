angular.module('ent.controllers', [])

.factory('sessionInjector', [function (SessionService) {

  var sessionInjector = {
    request: function(config) {
      if (localStorage.getItem('access_token')) {
        config.headers['Authorization'] = 'Bearer '+localStorage.getItem('access_token')

      }
      return config;
    },

    responseError: function(res) {
      //    alert('besoin de refreshToken');
      return res;
    }
  };
  return sessionInjector;
}])

.config(function($httpProvider) {
  $httpProvider.interceptors.push('sessionInjector');
  $httpProvider.defaults.withCredentials = true;
})

.controller('UserInfoCtrl', function($scope, $http, $state) {
  $http.get('https://recette-leo.entcore.org/auth/oauth2/userinfo').then(function(resp) {
    $scope.userinfo = resp.data;
  }, function(err) {
    alert('ERR', err.data.status);

  });

  $scope.jumpToInbox = function(){
    $state.go("app.messagerie");
    // alert("messagerie");
    // $state.go("app.inbox");
  }
})


.controller('AppCtrl', function($scope, $sce, $state, $sanitize, $cordovaInAppBrowser, $http,  $cordovaFileTransfer,$cordovaProgress, $cordovaFileOpener2){

  $scope.renderHtml = function(text){
    text = text.replace(/="\//g, "=\"https://recette-leo.entcore.org/");
    // text = text.replace(/href="\//g, "href=\"https://recette-leo.entcore.org/");

    //pb dans le cas de téléchargement de fichiers
    var newString = text.replace(/href="([\S]+)"/g, "onClick=\"window.open('$1', '_blank', 'location=no')\"");

    // var newString = text.replace(/href="([\S]+)"/g, "onClick=window.plugins.fileOpener.open(\"$1\")")

    // console.log(newString);
    return $sce.trustAsHtml(newString);
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

  $scope.getRealName = function(id, message){
    var returnName = "Inconnu";
    for(var i = 0; i< message.displayNames.length; i++){
      if(id == message.displayNames[i][0]){
        returnName = message.displayNames[i][1];
      }
    }
    return returnName;
  }

  // $scope.getAvatarUser = function(id){
  //   $http.get("https://recette-leo.entcore.org/userbook/api/person?id="+$scope.mail.from).then(function(resp){
  //     $scope.userFrom = resp.data;
  //
  //   }, function(err){
  //     alert('ERR:'+ err);
  //   });
  //   alert("https://recette-leo.entcore.org"+$scope.userFrom.result[0].photo);
  //   return "https://recette-leo.entcore.org"+$scope.userFrom.result[0].photo;
  // }

  $scope.logout = function(){
    localStorage.clear();
    $ionicHistory.clearHistory()
    $state.go("login");
  }
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
