angular.module('ent.profile_service', ['ent.profile'])

  .service('ProfileService', function (domainENT, RequestService, $http, $rootScope) {

    this.getUser = function () {
      $http.defaults.headers.common['Accept'] = '*/*';
      return RequestService.get(domainENT + '/directory/user/' + $rootScope.myUser.id);
    };

    this.getApplications = function () {
      return RequestService.get(domainENT + '/timeline/notifications-defaults');
    };

    this.getI18nNotifications = function () {
      return RequestService.get(domainENT + '/timeline/i18nNotifications');
    };

    this.getPreferences = function () {
      return RequestService.get(domainENT + '/userbook/preference/timeline');
    };

    this.updatePreferences = function (preferences) {
      return RequestService.put(domainENT + '/userbook/preference/timeline', preferences);
    }
  });
