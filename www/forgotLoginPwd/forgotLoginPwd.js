angular
  .module("ent.forgotLoginPwd", [])

  .controller("ForgotLoginPwdCtrl", function(
    $scope,
    ForgotLoginPwdService,
    getPopupFactory,
    $ionicHistory,
    $ionicLoading
  ) {
    $scope.loading = {};
    $scope.categories = {};

    $scope.$on("$ionicView.enter", function() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      ForgotLoginPwdService.getAuthTranslation().then(({ data }) => {
        $scope.translation = data;
        $ionicLoading.hide();
      });
    });

    $scope.toggleCategory = function(category) {
      if ($scope.categories.hasOwnProperty(category)) {
        delete $scope.categories[category];
      } else {
        $scope.categories = {};
        $scope.user = {};
        $scope.categories[category] = true;
      }
    };

    var displayError = function(err) {
      return showPopup(
        $scope.translation[`auth.notify.${err.data.error}.login`]
      );
    };

    $scope.sendLogin = function(login) {
      $scope.loading.login = true;

      ForgotLoginPwdService.getChannels(login).then(
        ({ data }) => {
          delete $scope.loading.login;
          $scope.user = data;
        },
        err => {
          delete $scope.loading.login;
          displayError(err);
        }
      );
    };

    $scope.recoverLoginUsingMail = function(mail, firstName, structureId) {
      recoverLogin(mail, firstName, structureId, "mail");
    };

    $scope.recoverLoginUsingMobile = function(mail, firstName, structureId) {
      recoverLogin(mail, firstName, structureId, "mobile");
    };

    var recoverLogin = function(mail, firstName, structureId, service) {
      $scope.loading[service] = true;

      ForgotLoginPwdService.recoverLogin(
        mail,
        firstName,
        structureId,
        service
      ).then(
        ({ data }) => {
          delete $scope.loading[service];
          if (data.hasOwnProperty("structures")) {
            $scope.user.structures = data.structures;
            $scope.data = {};
            $scope.data.structureId = $scope.user.structures[0].structureId;
          } else if (data.hasOwnProperty("mobile")) {
            showPopup($scope.translation[`auth.notify.${service}.sent`]);
            $scope.user.mobile = data.mobile;
          } else {
            showPopup($scope.translation[`auth.notify.${service}.sent`]);
          }
        },
        err => {
          delete $scope.loading[service];
          displayError(err);
        }
      );
    };

    $scope.recoverPwdUsingMail = function(login) {
      recoverPwd(login, "mail");
    };

    $scope.recoverPwdUsingMobile = function(login) {
      recoverPwd(login, "mobile");
    };

    var recoverPwd = function(login, channel) {
      $scope.loading[channel] = true;
      ForgotLoginPwdService.recoverPwd(login, channel).then(
        () => {
          delete $scope.loading[channel];
          showPopup($scope.translation[`auth.notify.${channel}.sent`]);
        },
        err => {
          delete $scope.loading[channel];
          displayError(err);
        }
      );
    };

    $scope.goBack = function() {
      $ionicHistory.goBack();
    };

    var showPopup = function(mode) {
      getPopupFactory.getAlertPopupNoTitle(mode);
    };
  });
