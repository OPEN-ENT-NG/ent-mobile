angular
  .module("ent.user", ["ent.request"])

  .service("SkinFactory", function($http, domainENT, RequestService) {
    this.getSkin = function() {
      return $http.get(domainENT + "/theme");
    };
  })

  .service("UserFactory", function(domainENT, $http, RequestService) {
    this.whoAmI = function(userId) {
      return RequestService.get(
        domainENT + "/userbook/api/person?id=" + userId
      );
    };

    this.getCurrentUser = function() {
      $http.defaults.headers.common["Accept"] = "version=2.1";
      return RequestService.get(domainENT + "/auth/oauth2/userinfo");
    };

    this.getTranslation = function() {
      return RequestService.get(domainENT + "/userbook/i18n");
    };
  })

  .service("TranslationService", function(UserFactory) {
    this.synchronized = false;
    this.translationUser = {};

    this.getAllTraductions = function() {
      if (!this.synchronized) {
        var that = this;
        UserFactory.getTranslation().then(
          function(result) {
            that.translationUser = result.data;
            that.synchronized = true;
          },
          function(response) {
            $scope.showAlertError(response);
            that.synchronized = true;
          }
        );
      }
    };

    this.getTraduction = function(key) {
      if (this.translationUser.hasOwnProperty(key)) {
        return this.translationUser[key];
      } else {
        return key;
      }
    };
  })

  .controller("UserCtrl", function(
    UserFactory,
    TranslationService,
    $scope,
    $rootScope,
    $http
  ) {
    $rootScope.$on("loggedIn", () => {
      getUser();
      TranslationService.getAllTraductions();
    });

    function getUser() {
      UserFactory.getCurrentUser().then(
        function(res) {
          $http.defaults.headers.common["Accept"] =
            "application/json;charset=UTF-8";
          UserFactory.whoAmI(res.data.userId).then(function(response) {
            console.log(response);
            $rootScope.myUser = response.data.result[0];
            $rootScope.myUser.groupsIds = res.data.groupsIds;
            $rootScope.myUser.photo = setProfileImage(
              $scope.myUser.photo,
              res.data.userId
            );
            $rootScope.myUser.userType = $rootScope.myUser.type[0];
            $rootScope.myUser.type = "directory." + $rootScope.myUser.type[0];
            $rootScope.myUser.translatedType = TranslationService.getTraduction(
              $rootScope.myUser.type
            );
          });
        },
        function errorCallback(response) {
          $scope.showAlertError(response);
        }
      );
    }
  });
