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

    this.getDirectoryUser = function(userId) {
      return RequestService.get(`${domainENT}/directory/user/${userId}`);
    };

    this.getApplications = function() {
      return RequestService.get(domainENT + "/timeline/notifications-defaults");
    };

    this.getI18nNotifications = function() {
      return RequestService.get(domainENT + "/timeline/i18nNotifications");
    };

    function formatProfile(unformattedProfile) {
      var keys = ["displayName", "email", "mobile", "loginAlias"];
      return $rootScope.pick(unformattedProfile, keys);
    }
  })

  .factory("UserFactory", function($rootScope, ProfileService) {
    var user = null;

    var foundRightEditLogin = function(authorizedActions) {
      return !!authorizedActions.find(
        right =>
          right.name ==
          "org.entcore.directory.controllers.UserController|allowLoginUpdate"
      );
    };

    var getUser = function(reset) {
      if (user && !reset) {
        return Promise.resolve(user);
      } else {
        return Promise.all([
          ProfileService.getUserbookProfile(),
          ProfileService.getOAuthUser()
        ])
          .then(results => {
            let userbookProfile = $rootScope.pick(results[0].data.result[0], [
              "userId",
              "login",
              "displayName",
              "photo",
              "type",
              "schools",
              "address",
              "email",
              "mobile"
            ]);
            let oauthProfile = $rootScope.pick(results[1].data, [
              "groupsIds",
              "birthDate",
              "firstName",
              "lastName"
            ]);

            user = $rootScope.extend({}, userbookProfile, oauthProfile);
            user.photo = setProfileImage(user.photo, user.id);
            user.type = user.type[0];
            user.allowedLoginUpdate = foundRightEditLogin(
              results[1].data.authorizedActions
            );
            return user;
          })
          .then(user =>
            Promise.all([
              Promise.resolve(user),
              ProfileService.getDirectoryUser(user.userId)
            ])
          )
          .then(result => {
            let user = result[0];
            user.loginAlias = result[1].data.loginAlias;
            return user;
          });
      }
    };

    return { getUser };
  });
