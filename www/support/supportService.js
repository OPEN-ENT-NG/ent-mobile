angular
  .module("ent.support_service", ["ent.request"])

  .service("SupportService", function(domainENT, RequestService) {
    // this.getTickets = function() {
    //   return RequestService.get(`${domainENT}/support/tickets`);
    // };

    // this.updateTicketStatus = function(tickets, status) {
    //   return RequestService.post(
    //     `${domainENT}/support/ticketstatus/${status}`,
    //     { ids: tickets }
    //   );
    // };

    // this.getComments = function(ticket) {
    //   return RequestService.get(
    //     `${domainENT}/support/ticket/${ticket.id}/comments`
    //   );
    // };

    // this.getAttachments = function(ticket) {
    //   return RequestService.get(
    //     `${domainENT}/support/ticket/${ticket.id}/attachments`
    //   );
    // };

    // this.getEvents = function(ticket) {
    //   return RequestService.get(`${domainENT}/support/events/${ticket.id}`);
    // };

    var appModules = [
      "timeline",
      "support",
      "workspace",
      "conversation",
      "actualites",
      "blog",
      "pronote"
    ];

    this.filterModules = function(appList) {
      return appList.filter(function(app) {
        return appModules.some(function(module) {
          if (module === "pronote") {
            return app.displayName.toLowerCase().includes(module.toLowerCase());
          } else if (app.prefix) {
            return app.prefix.toLowerCase() === "/" + module.toLowerCase();
          }
        });
      });
    };

    this.createTicket = function(ticket) {
      console.log(ticket);
      return RequestService.post(`${domainENT}/support/ticket`, ticket);
    };

    // this.updateTicket = function(ticket) {
    //   let ticket = {
    //     id: 5,
    //     subject: "Test",
    //     description: "Text",
    //     category: "/scrapbook",
    //     school_id: "f04074ae-e595-4e6b-96f5-26ce30c9dcdf",
    //     status: 1
    //   };
    //   return RequestService.put(
    //     `${domainENT}/support/ticket/${ticket.id}`,
    //     ticket
    //   );
    // };

    this.getTranslation = function() {
      return RequestService.get(`${domainENT}/support/i18n`);
    };

    this.getAllApps = function() {
      return RequestService.get(`${domainENT}/applications-list`);
    };
  });
