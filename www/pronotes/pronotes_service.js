angular.module('ent.pronotes_service', ['ent.request'])

  .service('PronoteService', function($http, domainENT, RequestService){

    this.getAllAccounts = function() {
      return RequestService.get(domainENT+"/applications-list").then(function (resp) {
        var pronotes = [];

        if (!!resp && !!resp.data && !!resp.data.apps) {

          for (var i = 0; i < resp.data.apps.length; i++) {
            if (resp.data.apps[i].name.indexOf("Pronote") > -1) {
              pronotes.push({
                name: resp.data.apps[i].name,
                address: domainENT + "/cas/oauth/login?service=" + encodeURIComponent(resp.data.apps[i].address)
              });
            }
          }
        }
        return pronotes;
      });
    };
  });
