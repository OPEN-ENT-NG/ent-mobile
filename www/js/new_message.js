angular.module('ent.new_message', [])

.controller('NewMessageCtrl', function($scope, $http, $rootScope){

  $scope.destinataires = [];


})
.directive('filterBox', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      getData: '&source',
      model: '=?',
      search: '=?filtertext'
    },
    link: function(scope, element, attrs) {
      attrs.minLength = attrs.minLength || 0;
      scope.placeholder = attrs.placeholder || '';
      scope.search = {value: ''};

      if (attrs.source) {
        scope.$watch('search.value', function (newValue, oldValue) {
          if (newValue.length > attrs.minLength) {
            scope.getData({str: newValue}).then(function (results) {
              scope.model = results;
            });
          } else {
            scope.model = [];
          }
        });
      }

      scope.clearSearch = function() {
        scope.search.value = '';
      };
    },
    template: ' <div id="filter-box" class="item item-input-inset">' +
    '<div class="item-input-wrapper">' +
    '<i class="icon ion-android-search"></i>' +
    '<input style="font-size: 1.2rem;" type="search" placeholder="{{placeholder}}" ng-model="search.value">' +
    '</div>' +

    '<button class="button button-clear ion-close" style="color: #333" ng-if="search.value.length > 0" ng-click="clearSearch()">' +
    '</button>' +
    '</div>'
  };
})
