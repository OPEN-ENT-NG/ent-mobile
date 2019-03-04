angular
  .module("ent.forgotLoginPwdService", ["ent.request"])
  .service("ForgotLoginPwdService", function(domainENT, RequestService) {
    this.getAuthTranslation = function() {
      return RequestService.get(`${domainENT}/auth/i18n`);
    };

    this.getChannels = function(login) {
      return RequestService.get(
        `${domainENT}/auth/password-channels?login=${login}`
      );
    };

    this.recoverLogin = function(
      mail,
      firstName,
      structureId = null,
      service = "mail"
    ) {
      let data = { mail, firstName, structureId, service };
      return RequestService.post(`${domainENT}/auth/forgot-id`, data);
    };

    this.recoverPwd = function(login, service) {
      let data = { login, service };
      return RequestService.post(`${domainENT}/auth/forgot-password`, data);
    };
  });
