angular.module('ent.actualites', [])

.factory('serviceActualites', function(){


  var store = {},
  self = {};

  self.getAllActualites = function() {
    if (!store.actualites) {
      store.actualites = [
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
    return store.actualites;
  };

  self.getActualite = function(index){
    return self.getAllActualites()[index] || undefined;
  };

  return self;

})

.controller('ActualitesCtrl', function($scope, $state, actualites) {
  $scope.getURL = function(index) {
    return $state.href('app.actualite', {index: index});
  };
  $scope.actualites = actualites;
})

.controller('ActualiteCtrl', function($scope, actualite) {
  $scope.actualite = actualite;
})
;
