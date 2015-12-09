angular.module('ent.wines', [])

.controller('myCtrl', function ($scope) {
    $scope.wines = [
        { name: "Wine A", category: "red" },
        { name: "Wine B", category: "red" },
        { name: "wine C", category: "white" },
        { name: "Wine D", category: "red" },
        { name: "Wine E", category: "red" },
        { name: "wine F", category: "white" },
        { name: "wine G", category: "champagne"},
        { name: "wine H", category: "champagne" }
    ];
    $scope.filter = {};

    // $scope.getCategories = function () {
    //     return ($scope.wines || []).map(function (w) {
    //         return w.category;
    //     }).filter(function (w, idx, arr) {
    //         return arr.indexOf(w) === idx;
    //     });
    // };

    $scope.filterByCategory = function (wine) {
        return $scope.filter[wine.category] || noFilter($scope.filter);
    };

    function noFilter(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key]) {
                return false;
            }
        }
        return true;
    }
});
