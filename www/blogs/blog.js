angular.module('ent.blog', ['ent.blog_service'])


.controller('BlogCtrl', function($scope, BlogsService, $stateParams, $ionicPopover, $rootScope){

  $scope.nameBlog = $stateParams.nameBlog;
  $scope.statePosts = BlogsService.getStatusPosts();
  getPostsByBlogId($stateParams.idBlog);

  console.log($scope.statePosts);
  for (var i = 0; i < $scope.statePosts.length; i++) {
    console.log($rootScope.translationBlog[$scope.statePosts[i].name]);
  }

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
  $scope.filter = getStatusPostsId();

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

  $scope.count = function (status){
    console.log("in count");
    var count =0;
    for(var i=0; i<$scope.posts.length; i++){
      if($scope.posts[i].status == status){
        count ++;
      }
    }
    return count;
  }

  $ionicPopover.fromTemplateUrl('blogs/popover_blogs.html', {
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

  function getStatusPostsId(){
    var array =[];
    var values = BlogsService.getStatusPosts();
    for(var i=0; i<values.length; i++){
      array[i] = values[i].id;
    }
    return array;
  }
  function getPostsByBlogId(id){
    $scope.posts = [];
    var commentsByPostArray = [];

    BlogsService.getAllPostsByBlogId(id, getStatusPostsId()).then(function(res) {
      $scope.posts = res;
    })
    .then(function(){
      BlogsService.getAuthors(id, $scope.posts).then(function(resAuthors) {
        for(var i=0; i<$scope.posts.length; i++){
          $scope.posts[i].author.photo = $scope.setProfileImage(findElementById(resAuthors, $scope.posts[i].author.userId).photo, $scope.posts[i].author.userId);
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
