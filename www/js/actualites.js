angular.module('ent.actualites', [])

.factory('serviceActualites', function(){
  var store = {},
  self = {};

  self.getAllInfos = function() {

    $http.get("https://recette-leo.entcore.org/actualites/infos")
    if (!store.infos) {
      store.infos = [
        {
          id: 1,
          //icon: "ion-calendar",
          titre: "Life Skills end course",
          start: "8/1/2015 9:00am",
          end: "10/1/2015 5:30pm"
        },
        {
          id: 2,
          //  icon: "ion-calendar",
          titre: "Women and sports",
          start: "11/1/2015 10:00am",
          end: "11/1/2015 12:00am"
        },
        {
          id: 3,
          //icon: "ion-calendar",
          titre: "Development and sports",
          start: "19/1/2015 7:00am",
          end: "20/1/2015 2:30pm"
        },
        {
          id: 4,
          //icon: "ion-calendar",
          titre: "New course",
          start: "1/2/2015 10:00am",
          end: "3/2/2015 6:00pm"
        },
      ]
    }
    return store.infos;
  };

  return self;

})

.controller('ActualitesCtrl', function($scope, $state, $ionicPopover, actualites) {
  $scope.actualites = actualites;

  $ionicPopover.fromTemplateUrl('templates/popover_actualites.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.popover = popover;
   });

   $scope.openPopover = function($event) {
      $scope.popover.show($event);
   };

   $scope.closePopover = function() {
      $scope.popover.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.popover.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });
});
