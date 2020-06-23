angular
  .module("ent.timeline_service", ["ent.request"])

  .service("TimelineService", function (domainENT, RequestService, $q) {
    this.getTimeline = function (filter) {
      const params = { page: (0).toString() };
      const filterParams = filter
        .map(function (filterItem) {
          return "type=" + filterItem;
        })
        .join("&");
      return RequestService.get(
        `${domainENT}/timeline/lastNotifications?${filterParams}`,
        params
      );
    };

    this.getTypes = function () {
      return RequestService.get(domainENT + "/timeline/types");
    };

    this.getPreferences = function () {
      return RequestService.get(domainENT + "/userbook/preference/timeline");
    };

    this.getTranslation = function () {
      let translationNotif = RequestService.get(
        domainENT + "/timeline/i18nNotifications"
      );
      let translationTimeline = RequestService.get(
        domainENT + "/timeline/i18n"
      );
      return $q.all([translationNotif, translationTimeline]);
    };

    this.updatePreferences = function (preferences) {
      return RequestService.put(
        domainENT + "/userbook/preference/timeline",
        null,
        preferences
      );
    };

    this.getFlashMsg = function () {
      return RequestService.get(`${domainENT}/timeline/flashmsg/listuser`);
    };

    this.markAsRead = function (id) {
      return RequestService.put(
        `${domainENT}/timeline/flashmsg/${id}/markasread`
      );
    };
  });
