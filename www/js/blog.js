angular.module('ent.blog', ['ent.controllers'])

.service('BlogsService', function($http, domainENT){
  this.getAllBlogs = function () {
    return $http.get(domainENT+"/blog/list/all");
  }

  this.getAllPostsByBlogId = function(id){
    return $http.get(domainENT+"/blog/post/list/all/"+id);
  }

  this.getUserData = function (userId) {
    return $http.get(domainENT+"/userbook/api/person?id="+userId);
  }

})

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
    }), function(err){
      alert('ERR:'+ err);
    }
  }
})

.controller('BlogCtrl', function($scope, BlogsService, $stateParams, domainENT, $q){

  getPostsByBlogId($stateParams.idBlog);
  console.log($scope.posts);

  $scope.doRefreshPosts = function() {
    $scope.posts.unshift(getPostsByBlogId($stateParams.idBlog));
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getPostsByBlogId(id){
    $scope.posts = [];
    BlogsService.getAllPostsByBlogId(id).then(function(resp){
      $scope.posts = resp.data;
    }), function(err){
      log(err);
    }
    // for(var i=0; i<$scope.posts.length; i++){
    //   BlogsService.getUserData($scope.posts[i].author.userId).then(function(response){
    //     $scope.posts[i].author.photo = domainENT + response.data.result[0].photo;
    //   }), function(err){
    //     log(err);
    //   }
    // }

    //     $scope.product_list_1 = $http.get('FIRSTRESTURL', {cache: false});
    // $scope.product_list_2 = $http.get('SECONDRESTURL', {'cache': false});
    //
    // $q.all([$scope.product_list_1, $scope.product_list_2]).then(function(values) {
    //     $scope.results = MyService.doCalculation(values[0], values[1]);
    // });
  }
});
