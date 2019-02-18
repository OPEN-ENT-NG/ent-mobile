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

      /* , {
        headers: { "Content-Type": "application/json" }
      }*/
      /*{
    "structures": [
        {
            "structureName": "Mairie de Paris",
            "structureId": "27a1b7bf-d99c-419a-8fd8-f585da02757c"
        },
        {
            "structureName": "RECTORAT-ACADEMIE DE PARIS-ac-PARIS",
            "structureId": "6f500a20-1bfc-40c6-96ae-91a0e39790a3"
        },
        {
            "structureName": "CLG-ALBERTO GIACOMETTI-ac-PARIS",
            "structureId": "9f4ca91c-0d9b-4a53-b057-4d74685b0412"
        },
        {
            "structureName": "CLG-JEAN-FRANCOIS OEBEN-ac-PARIS",
            "structureId": "1945a0e2-a6e1-4e06-93e6-781988bd4fea"
        }
    ]
} 


{
    "mobile": "......0589"
}*/
    };

    this.recoverPwd = function(login, service) {
      let data = { login, service };
      return RequestService.post(`${domainENT}/auth/forgot-password`, data);
    };
  });
