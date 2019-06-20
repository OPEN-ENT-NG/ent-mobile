angular
  .module("ent.profile_service", ["ent.profile"])

  .service("ProfileService", function(domainENT, RequestService, $rootScope) {
    this.saveProfile = function(profile) {
      return RequestService.put(
        `${domainENT}/directory/user/${$rootScope.myUser.userId}`,
        formatProfile(profile)
      );
    };

    this.getTranslation = function() {
      return RequestService.get(domainENT + "/userbook/i18n");
    };

    this.getUserbookProfile = function() {
      return RequestService.get(domainENT + "/userbook/api/person");
    };

    this.getOAuthUser = function() {
      return RequestService.get(domainENT + "/auth/oauth2/userinfo", {
        headers: { Accept: "version=2.1" }
      });
    };

    this.getApplications = function() {
      return RequestService.get(domainENT + "/timeline/notifications-defaults");
    };

    this.getI18nNotifications = function() {
      return RequestService.get(domainENT + "/timeline/i18nNotifications");
    };

    function formatProfile(unformattedProfile) {
      var keys = [
        "displayName",
        "firstName",
        "lastName",
        "address",
        "email",
        "homePhone",
        "mobile",
        "birthDate"
      ];
      let result = $rootScope.pick(unformattedProfile, keys);
      result.birthDate = moment(result.birthDate).format("YYYY-MM-D");
      return result;
    }
  })

  .factory("UserFactory", function($rootScope, ProfileService) {
    var user = null;

    var getUser = function(reset) {
      if (user && !reset) {
        return Promise.resolve(user);
      } else {
        return Promise.all([
          ProfileService.getUserbookProfile(),
          ProfileService.getOAuthUser()
        ]).then(results => {
          let userbookProfile = $rootScope.pick(results[0].data.result[0], [
            "userId",
            "login",
            "displayName",
            "photo",
            "type",
            "schools",
            "address",
            "email",
            "tel",
            "mobile"
          ]);
          console.log("userbookProfile", userbookProfile);
          let oauthProfile = $rootScope.pick(results[1].data, [
            "groupsIds",
            "birthDate",
            "firstName",
            "lastName"
          ]);
          console.log("oauthProfile", oauthProfile);

          user = $rootScope.extend({}, userbookProfile, oauthProfile);
          console.log("user", user);

          user.photo = setProfileImage(user.photo, user.id);
          user.type = user.type[0];
          return user;
        });
      }
    };

    return { getUser };
  });
