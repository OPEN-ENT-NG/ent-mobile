angular
  .module("ent.timeline_service", ["ent.request"])

  .service("TimelineService", function(domainENT, RequestService) {
    this.getTimeline = function(filter) {
      return RequestService.get(
        domainENT + "/timeline/lastNotifications?page=0" + filter
      );
    };

    this.getTypes = function() {
      return RequestService.get(domainENT + "/timeline/types");
    };

    this.getPreferences = function() {
      return RequestService.get(domainENT + "/userbook/preference/timeline");
    };

    this.getTranslation = function() {
      let translationNotif = RequestService.get(
        domainENT + "/timeline/i18nNotifications"
      );
      let translationTimeline = RequestService.get(
        domainENT + "/timeline/i18n"
      );
      return Promise.all([translationNotif, translationTimeline]);
    };

    this.updatePreferences = function(preferences) {
      return RequestService.put(
        domainENT + "/userbook/preference/timeline",
        preferences
      );
    };

    this.getFlashMsg = function() {
      return RequestService.get(`${domainENT}/timeline/flashmsg/listuser`);
    };

    this.markAsRead = function(id) {
      return RequestService.put(
        `${domainENT}/timeline/flashmsg/${id}/markasread`
      );
    };
  });
