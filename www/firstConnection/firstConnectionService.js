angular.module('ent.firstConnectionService', [])

  .service('FirstConnectionService', function (domainENT, RequestService, $httpParamSerializer) {

    this.getPasswordRegex = function () {
      return RequestService.get(domainENT + '/auth/context');
    };

    this.activate = function(user) {
      return RequestService.post(domainENT + '/auth/activation', $httpParamSerializer({
        theme: '',
        login: user.login,
        password: user.password,
        confirmPassword: user.confirmPassword,
        acceptCGU: user.acceptCGU ,
        activationCode: user.activationCode,
        mail: user.mail || '',
        phone: user.phone || ''
      }));
    };
  });
