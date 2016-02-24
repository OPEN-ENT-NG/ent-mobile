angular.module('ent.blog', [])

.service('BlogsService', function($http, domainENT, $q, UserInfoService){

  this.getAllPostsByBlogId = function(id, arrayStates){
    var promisesPosts = [];
    var deferredCombinedItemsPosts = $q.defer();
    var combinedItemsPosts = [];

    angular.forEach(arrayStates, function(item) {
      var deferredItemListPosts = $q.defer();
      $http.get(domainENT+"/blog/post/list/all/"+id+"?state="+item).then(function(resp) {
        combinedItemsPosts = combinedItemsPosts.concat(resp.data);
        deferredItemListPosts.resolve();
      });
      promisesPosts.push(deferredItemListPosts.promise);
    });

    $q.all(promisesPosts).then(function() {
      deferredCombinedItemsPosts.resolve(combinedItemsPosts);
    });
    return deferredCombinedItemsPosts.promise;
  }

  this.getPostsByStatus = function(id, status){
    return $http.get(domainENT+"/blog/post/list/all/"+id+"?state="+status);
  }

  this.getAuthors = function (idBlog, posts){
    var promisesAuthors = [];
    var deferredCombinedItemsAuthors = $q.defer();
    var combinedItemsAuthors = [];

    angular.forEach(posts, function(item) {
      var deferredItemListAuthors = $q.defer();
      $http.get(domainENT+"/userbook/api/person?id="+item.author.userId).then(function(resp) {
        combinedItemsAuthors = combinedItemsAuthors.concat(resp.data.result[0]);
        deferredItemListAuthors.resolve();
      });
      promisesAuthors.push(deferredItemListAuthors.promise);
    });

    $q.all(promisesAuthors).then(function() {
      deferredCombinedItemsAuthors.resolve(combinedItemsAuthors);
    });
    return deferredCombinedItemsAuthors.promise;
  }

  this.getComments = function(idBlog, posts){
    var promisesComments = [];
    var deferredCombinedItemsComments = $q.defer();
    var combinedItemsComments = [];

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
  }

  this.getCommentNumberByPost = function(idBlog, posts){
    var commentsNumberByPost = [];

    angular.forEach(posts, function(item) {
      $http.get(domainENT+"/blog/comments/"+idBlog+"/"+item._id).then(function(resp) {
        commentsNumberByPost.push(resp.data.length);
      });
    });
    return commentsNumberByPost;
  }

  this.getStatusPosts = function(){
    return  ["SUBMITTED", "DRAFT","PUBLISHED"];
  }
})

.controller('BlogCtrl', function($scope, BlogsService, $stateParams, $ionicPopover){

  $scope.statePosts = BlogsService.getStatusPosts();
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


  $scope.filterByStatus = function (post) {
    if ($scope.filter.length > 0) {
      if ($scope.filter.indexOf(post.state) < 0){
        return;
      }
    }
    return post;
  };

  // selected states
  $scope.filter = BlogsService.getStatusPosts();

  // toggle selection for a given fruit by name
  $scope.toggleSelection = function toggleSelection(state) {
    var idx = $scope.filter.indexOf(state);

    // is currently selected
    if (idx > -1) {
      $scope.filter.splice(idx, 1);
    }

    // is newly selected
    else {
      $scope.filter.push(state);
    }
  };

  $ionicPopover.fromTemplateUrl('templates/popover_blogs.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  })

  function getPostsByBlogId(id){
    $scope.posts = [];
    var commentsByPostArray = [];

    BlogsService.getAllPostsByBlogId(id, $scope.statePosts).then(function(res) {
      $scope.posts = res;
    })
    .then(function(){
      BlogsService.getAuthors(id, $scope.posts).then(function(resAuthors) {
        for(var i=0; i<$scope.posts.length; i++){
          $scope.posts[i].author.photo = resAuthors[i].photo;
        }
      })
      .then(function(){
        commentsByPostArray = BlogsService.getCommentNumberByPost(id,$scope.posts);
        BlogsService.getComments(id, $scope.posts).then(function(resComments) {
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
