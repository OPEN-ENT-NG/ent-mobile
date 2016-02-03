angular.module('ent.blog', ['ent.controllers'])

.service('BlogsService', function($http, domainENT, $q, UserInfoService){

  var posts=[];
  var authors =[];
  var comments =  [];
  this.getAllPostsByBlogId = function(id){
    return $http.get(domainENT+"/blog/post/list/all/"+id);
  }

  this.getCompleteBlog = function(idBlog) {
    var promisesAuthors = [];
    var deferredCombinedItemsAuthors = $q.defer();
    var combinedItemsAuthors = [];

    var promisesComments = [];
    var deferredCombinedItemsComments = $q.defer();
    var combinedItemsComments = [];


    return $http.get(domainENT+"/blog/post/list/all/"+idBlog).then(function(res) {
      posts = res.data;
      angular.forEach(posts, function(item) {
        var deferredItemListAuthors = $q.defer();
        $http.get(domainENT+"/userbook/api/person?id="+item.author.userId).then(function(resp) {
          combinedItemsAuthors = combinedItemsAuthors.concat(resp.data.result[0]);
          deferredItemListAuthors.resolve();
        });
        promisesAuthors.push(deferredItemListAuthors.promise);
      });

      $q.all(promisesAuthors).then( function() {
        deferredCombinedItemsAuthors.resolve(combinedItemsAuthors);
      });

      console.log("deferredCombinedItemsAuthors.promise");
      console.log(deferredCombinedItemsAuthors.promise);
      return deferredCombinedItemsAuthors.promise;
    })
    .then(function(response){
      angular.forEach(posts, function(item) {
        var deferredItemListComments = $q.defer();
        $http.get(domainENT+"/blog/comments/"+idBlog+"/"+item._id).then(function(resp) {
          combinedItemsComments = combinedItemsComments.concat(resp.data);
          deferredItemListComments.resolve();
        });
        promisesComments.push(deferredItemListComments.promise);
      });

      $q.all(promisesComments).then( function() {
        deferredCombinedItemsComments.resolve(combinedItemsComments);
      });
      console.log("deferredCombinedItemsComments.promise");
      console.log(deferredCombinedItemsComments.promise);
      return deferredCombinedItemsComments.promise;
    });
  }
})


.controller('BlogCtrl', function($scope, BlogsService, $stateParams){

  getPostsByBlogId($stateParams.idBlog);
  // getPostsByBlogId($stateParams.idBlog);
  // getAuthors($scope.posts);

  $scope.doRefreshPosts = function() {
    $scope.posts.unshift(getPostsByBlogId($stateParams.idBlog));
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getPostsByBlogId(id){
    $scope.posts = [];
    BlogsService.getCompleteBlog(id).then(function(res) {
      console.log(res);
    }), function(err){
      console.log(err);
    }
  }
  //
  // function getCompleteBlog(id){
  //   BlogsService.getAuthorsByBlog(id).then(function(result){
  //     console.log(result);
  //   }), function(err){
  //     console.log(err);
  //   }
  // }
});
