angular.module('ent.actualites_service', ['ent.request'])

.service('ActualitesService', function($http, domainENT, RequestService){
  this.getAllInfos = function(){
    return RequestService.get(domainENT+"/actualites/infos");
  }

  this.getAllThreads = function(){
    return RequestService.get(domainENT+"/actualites/threads");
  }

  this.getTranslation = function(){
    return RequestService.get(domainENT+"/actualites/i18n");
  }

  this.setFcmToken = function() {
    window.FirebasePlugin.getToken(function (token) {
      if (token == null)
        setTimeout(setFcmToken, 1000);
      var url = domainENT + "/timeline/pushNotif/fcmToken?fcmToken=" + token;
      console.log(url);
      RequestService.put(url).then(function (response) {
        console.log(response);
      }, function (error) {
        console.log("put token failed");
      });
    });
  }
})
