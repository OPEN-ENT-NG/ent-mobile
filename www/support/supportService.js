angular
  .module("ent.support_service", ["ent.request"])

  .service("SupportService", function(domainENT, RequestService) {
    this.createTicket = function(ticket) {
      return RequestService.post(`${domainENT}/support/ticket`, null, ticket);
    };

    this.getTranslation = function() {
      return RequestService.get(`${domainENT}/support/i18n`);
    };
  });
