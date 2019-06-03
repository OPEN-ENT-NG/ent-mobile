angular
  .module("ent.user", ["ent.request"])

  // .service("SkinFactory", function($http, domainENT, RequestService) {
  //   this.getSkin = function() {
  //     return $http.get(domainENT + "/theme");
  //   };
  // })

  .service("UserService", function(domainENT, RequestService) {
    this.getTranslation = function() {
      return RequestService.get(domainENT + "/userbook/i18n");
    };

    this.whoAmI = function(userId) {
      return RequestService.get(
        domainENT + "/userbook/api/person?id=" + userId
      );
    };

    this.getCurrentUser = function() {
      return RequestService.get(domainENT + "/auth/oauth2/userinfo", {
        headers: { Accept: "version=2.1" }
      });
    };

    this.getUser = function() {
      console.log("Fetching User !");
      return this.getCurrentUser().then(result => {
        console.log("Id fetched", result);
        return this.whoAmI(result.data.userId).then(response => {
          console.log("user fetched", response);
          me = response.data.result[0];
          me.groupsIds = result.data.groupsIds;
          me.photo = setProfileImage(me.photo, result.data.userId);
          me.userType = me.type[0];
          console.log("resolving user");
          return me;
        });
      });
    };
  });
