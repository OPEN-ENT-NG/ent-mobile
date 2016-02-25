angular.module('ent.blog-list', ['ent.blog_service'])

.controller('BlogListCtrl', function($scope, BlogsService) {

  getListBlogs();

  $scope.doRefreshBlogs = function() {
    $scope.blogs.unshift(getListBlogs());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getListBlogs (){
    $scope.blogs =[];
    BlogsService.getAllBlogs().then(function (resp) {
      $scope.blogs = resp.data;
      for(var i=0; i<$scope.blogs.length; i++){
          $scope.blogs[i].thumbnail = $scope.setCorrectImage($scope.blogs[i].thumbnail ,"/../../img/illustrations/blog-default.png")
      }
    }), function(err){
      alert('ERR:'+ err);
    }
  }
});
