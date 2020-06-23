angular
  .module("ent.firstConnectionService", [])

  .service("FirstConnectionService", function (domainENT, RequestService) {
    this.getPasswordRegex = function () {
      return RequestService.get(domainENT + "/auth/context");
    };

    this.getAuthTranslation = function () {
      return RequestService.get(`${domainENT}/auth/i18n`);
    };

    this.activate = function (user) {
      return RequestService.post(
        domainENT + "/auth/activation",
        null,
        {
          theme: "",
          login: user.login,
          password: user.password,
          confirmPassword: user.confirmPassword,
          acceptCGU: user.acceptCGU,
          activationCode: user.activationCode,
          mail: user.mail || "",
          phone: user.phone || "",
        },
        {},
        true
      );
    };
  });
