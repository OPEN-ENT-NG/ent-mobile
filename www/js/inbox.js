
angular.module('ent.inbox', [])

.controller('InboxCtrl', function($scope, $http, $state){

  // $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
  //   viewData.enableBack = true;
  // });

  $scope.goToMessageFolders = function(){
    alert("back");
    $state.go("app.messagerie");
  }
});
