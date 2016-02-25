angular.module('ent.blog-list', ['ent.blog_service'])

.controller('BlogListCtrl', function($scope, $rootScope, $state, BlogsService) {

  getListBlogs();
  getTraduction();

  $scope.goToBlog = function(blog){
    $state.go("app.blog", {nameBlog: blog.title, idBlog:blog._id})
  }


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

  function getTraduction(){
    BlogsService.getTraduction().then(function(resp){
      $rootScope.translationBlog = resp.data;
    }), function(err){
      alert('ERR:'+ err);
    }
  }
});
