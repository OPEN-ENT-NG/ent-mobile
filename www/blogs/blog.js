angular.module('ent.blog', ['ent.blog_service'])


  .controller('BlogCtrl', function($scope, BlogsService, $stateParams, $ionicPopover, $rootScope, $filter, $ionicLoading){

    $scope.nameBlog = $stateParams.nameBlog;
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

    $scope.getPostContent = function(post){
      if(post.content !== undefined) {
        return;
      }
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      BlogsService.getPostContentById($stateParams.idBlog, post._id)
        .then(function(res) {
          post.content = res.data.content;
          BlogsService.getPostCommentsById($stateParams.idBlog, post._id)
            .then(function (res) {
              post.comments = res.data;
              $ionicLoading.hide();
            }, function (err) {
              post.comments = [];
              $ionicLoading.hide();
            });
        }, function (err) {
          post.content = null;
          $ionicLoading.hide();
          $scope.showAlertError(err);
        });
    }

    function getPostsByBlogId(id){
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      $scope.posts = [];

      BlogsService.getAllPostsByBlogId(id).then(function(res) {
        $scope.posts = res.data;
        console.log($scope.posts);
      })
        .then(function(){
          BlogsService.getAuthors(id, $scope.posts).then(function(resAuthors) {
            for(var i=0; i<$scope.posts.length; i++){
              $scope.posts[i].author.photo = setProfileImage(findElementById(resAuthors, $scope.posts[i].author.userId).photo, $scope.posts[i].author.userId);
            }
            $ionicLoading.hide();
          });
        }, function(err){
          $ionicLoading.hide();
          $scope.showAlertError(err)
        });
    }
  });
