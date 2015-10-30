angular.module('ent.actualites', [])

.controller('ActualitesCtrl', function($scope) {
  $scope.actualites = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('ActualiteCtrl', function($scope, $stateParams) {
})
