angular.module('ent.blog-list', [])

.service('BlogsListService', function($http, domainENT){
  this.getAllBlogs = function () {
    return $http.get(domainENT+"/blog/list/all");
  }
})

.controller('BlogListCtrl', function($scope, BlogsListService) {

  getListBlogs();

  $scope.doRefreshBlogs = function() {
    $scope.blogs.unshift(getListBlogs());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getListBlogs (){
    $scope.blogs =[];
    BlogsListService.getAllBlogs().then(function (resp) {
      $scope.blogs = resp.data;
    }), function(err){
      alert('ERR:'+ err);
    }
  }
});
