angular.module('ent.profile', ['ent.profile_service'])
  .controller('ProfileCtrl', function ($scope, $rootScope, $ionicPopover, $ionicPlatform, domainENT, ProfileService){
    $ionicPlatform.ready(function() {

      $scope.$on('$ionicView.enter', function () {
        $rootScope.navigator = navigator;
        ProfileService.getUser().then(function (res){
          console.log("test");
          $scope.myUser = $rootScope.myUser;
          $scope.user = res;
          var _splitted_date = res.data.birthDate.split('-');
          $scope.birthdate = new Date(_splitted_date[0], _splitted_date[1] - 1, _splitted_date[2]).toLocaleDateString();
          console.log($rootScope.myUser);
          console.log(res);
        })
      });
    });
  });
