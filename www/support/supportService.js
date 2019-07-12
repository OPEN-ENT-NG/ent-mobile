angular
  .module("ent.support_service", ["ent.request"])

  .service("SupportService", function(domainENT, RequestService) {
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

    this.getTranslation = function() {
      return RequestService.get(`${domainENT}/support/i18n`);
    };

    this.getAllApps = function() {
      return RequestService.get(`${domainENT}/applications-list`);
    };
  });
