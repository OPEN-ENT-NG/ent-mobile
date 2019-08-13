angular
  .module("ent.profile_service", ["ent.profile"])

  .service("ProfileService", function(domainENT, RequestService, $rootScope) {
    this.saveProfile = function(profile) {
      return RequestService.put(
        `${domainENT}/directory/user/${$rootScope.myUser.userId}`,
        profile
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

    this.getAllApps = function() {
      return RequestService.get(`${domainENT}/applications-list`);
    };
  })

  .factory("UserFactory", function($rootScope, ProfileService, domainENT) {
    var user = null;
    var apps = null;

    var foundRightEditLogin = function(authorizedActions) {
      return !!authorizedActions.find(
        right =>
          right.name ==
          "org.entcore.directory.controllers.UserController|allowLoginUpdate"
      );
    };

    var getApplicationsList = function(reset) {
      if (apps && !reset) {
        return Promise.resolve(apps);
      } else {
        var getTypeApp = app => {
          if (
            app.name.toUpperCase().indexOf("PRONOTE") > -1 ||
            app.displayName.toUpperCase().indexOf("PRONOTE") > -1
          ) {
            return "PRONOTE";
          } else if (app.address.indexOf("viescolairefr") > -1) {
            return "LVS";
          } else {
            return null;
          }
        };

        var getApp = app => {
          switch (getTypeApp(app)) {
            case "PRONOTE": {
              return {
                name: app.displayName,
                address:
                  domainENT +
                  "/cas/oauth/login?service=" +
                  encodeURIComponent(app.address),
                type: "PRONOTE"
              };
            }
            case "LVS": {
              return {
                name: app.displayName,
                address: domainENT + app.address + "&noRedirect=true",
                type: "LVS"
              };
            }
            default: {
              return app;
            }
          }
        };

        return ProfileService.getAllApps().then(function(resp) {
          apps = resp.data.apps.map(getApp);
          return apps;
        });
      }
    };

    var hasPronoteAccount = function() {
      return getPronoteAccount().length > 0;
    };

    var getPronoteAccount = function() {
      if (!!apps) {
        return apps.filter(app => !!app.type && app.type == "PRONOTE");
      } else {
        return [];
      }
    };

    var hasLVSAccount = function() {
      return getLVSAccount().length > 0;
    };

    var getLVSAccount = function() {
      if (!!apps) {
        return apps.filter(app => !!app.type && app.type == "LVS");
      } else {
        return [];
      }
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

            user = Object.assign({}, userbookProfile, oauthProfile);
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
              ProfileService.getDirectoryUser(user.userId),
              getApplicationsList()
            ])
          )
          .then(result => {
            let user = result[0];
            user.loginAlias = result[1].data.loginAlias;
            return user;
          });
      }
    };

    return {
      getUser,
      getPronoteAccount,
      hasPronoteAccount,
      getLVSAccount,
      hasLVSAccount,
      getApplicationsList
    };
  });
