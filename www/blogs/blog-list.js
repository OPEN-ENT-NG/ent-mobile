angular.module('ent.blog-list', ['ent.blog_service'])

.controller('BlogListCtrl', function($scope, $rootScope, $state, BlogsService, $ionicLoading) {

  getListBlogs();

  $scope.goToBlog = function(blog){
    $state.go("app.blog", {nameBlog: blog.title, idBlog:blog._id})
  }


  $scope.doRefreshBlogs = function() {
    $scope.blogs.unshift(getListBlogs());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getListBlogs (){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.blogs =[];
    BlogsService.getAllBlogs().then(function (resp) {
      $scope.blogs = resp.data;
      for(var i=0; i<$scope.blogs.length; i++){
        $scope.blogs[i].thumbnail = $scope.setCorrectImage($scope.blogs[i].thumbnail ,"/../../img/illustrations/blog-default.png")
      }
      $ionicLoading.hide();
    }), function(err){
      $ionicLoading.hide();
      $scope.showAlertError(err);
    }
  }
});
