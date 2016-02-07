angular.module('ent.blog', ['ent.controllers'])

.service('BlogsService', function($http, domainENT, $q, UserInfoService){

  this.getAllPostsByBlogId = function(id){
    return $http.get(domainENT+"/blog/post/list/all/"+id);
  }

  this.getAuthors = function (idBlog){
    var promisesAuthors = [];
    var deferredCombinedItemsAuthors = $q.defer();
    var combinedItemsAuthors = [];

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
      return deferredCombinedItemsAuthors.promise;
    });
  }

  this.getComments = function(idBlog){
    var promisesComments = [];
    var deferredCombinedItemsComments = $q.defer();
    var combinedItemsComments = [];

    return $http.get(domainENT+"/blog/post/list/all/"+idBlog).then(function(res) {
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

      return deferredCombinedItemsComments.promise;
    });
  }

  this.getCommentNumberByPost = function(idBlog){
    var commentsNumberByPost = [];

    return $http.get(domainENT+"/blog/post/list/all/"+idBlog).then(function(res) {
      commentsNumberByPost = [];
      angular.forEach(posts, function(item) {
        $http.get(domainENT+"/blog/comments/"+idBlog+"/"+item._id).then(function(resp) {
          commentsNumberByPost.push(resp.data.length);
        });
      });
      return commentsNumberByPost;
    });
  }

})


.controller('BlogCtrl', function($scope, BlogsService, $stateParams){

  getPostsByBlogId($stateParams.idBlog);


  $scope.getCountComments = function(post){
    if(post.comments != null){
      var size = post.comments.length;
      var unite = size ==1 ? "Commentaire":"Commentaires";
      return size+" "+unite;
    }
  }

  /*
  * if given group is the selected group, deselect it
  * else, select the given group
  */
  $scope.toggleComments = function(post) {
    if ($scope.areCommentsShown(post)) {
      $scope.shownComments = null;
    } else {
      $scope.shownComments = post;
    }
  };

  $scope.areCommentsShown = function(post) {
    return $scope.shownComments === post;
  };


  $scope.doRefreshPosts = function() {
    $scope.posts.unshift(getPostsByBlogId($stateParams.idBlog));

    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getPostsByBlogId(id){
    $scope.posts = [];
    var commentsByPostArray = [];

    BlogsService.getAllPostsByBlogId(id).then(function(res) {
      $scope.posts = res.data;
    })
    .then(function(){
      BlogsService.getAuthors(id).then(function(resAuthors) {
        for(var i=0; i<$scope.posts.length; i++){
          $scope.posts[i].author.photo = resAuthors[i].photo;
        }
      }).then(function(){
        BlogsService.getCommentNumberByPost(id).then(function(resNumber){
          commentsByPostArray = [];
          commentsByPostArray = resNumber;
        })
      })
      .then(function(){
        BlogsService.getComments(id).then(function(resComments) {
          var k = 0;
          for(var i=0; i< $scope.posts.length; i++){
            $scope.posts[i].comments =[];
            for(var j = 0; j< commentsByPostArray[i]; j++){
              $scope.posts[i].comments[j] = resComments[k];
              k++;
            }
          }
        })
      })
    }), function(err){
      console.log(err);
    }
  }
});
