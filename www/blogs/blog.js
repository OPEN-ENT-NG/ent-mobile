angular.module('ent.blog', ['ent.blog_service'])


  .controller('BlogCtrl', function($scope, $ionicPopup, BlogsService, $stateParams, $ionicPopover, $rootScope, $filter, $ionicLoading){

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

    $scope.commentPost = function (post) {

      $scope.data = {};

      if ($scope.isRightToComment()) {

        var myPopup = $ionicPopup.show({
          template: '<input type="text" ng-model="data.comment">',
          title: $rootScope.translationBlog["blog.comment"],
          scope: $scope,
          buttons: [
            {text: $rootScope.translationBlog["cancel"]},
            {
              text: '<b>' + $rootScope.translationBlog["blog.comment"] + '</b>',
              type: 'button-positive',
              onTap: function (e) {
                if (!$scope.data.comment) {
                  e.preventDefault();
                } else {
                  return $scope.data.comment;
                }
              }
            }
          ]
        });

        myPopup.then(function (res) {
          if (res) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"/>'
            });
            BlogsService.commentPostById($stateParams.idBlog, post._id, res).then(function(result) {
              BlogsService.getPostCommentsById($stateParams.idBlog, post._id)
                .then(function (res) {
                  post.comments = res.data;
                  $ionicLoading.hide();
                }, function (err) {
                  post.comments = [];
                  $ionicLoading.hide();
                });
              $ionicLoading.hide();
            }, function (err) {
              $scope.showAlertError(err);
              $ionicLoading.hide();
            });
          }
        })
      }
    };

    $scope.isRightToComment = function () {

      if ($rootScope.blog.author.userId == $rootScope.myUser.userId) {
        return true;
      } else {
        for (var i = 0; i < $rootScope.blog.shared.length; i++) {
          if (($rootScope.blog.shared[i]['userId'] == $rootScope.myUser.userId
            || $rootScope.myUser.groupsIds.some(function (id) {
              return id == $rootScope.blog.shared[i]['groupId'];
            }))
            && $rootScope.blog.shared[i]['org-entcore-blog-controllers-PostController|comment']) {
            return true;
          }
        }
      }
      return false;
    };

    $scope.doRefreshPosts = function() {
      $scope.posts.unshift(getPostsByBlogId($stateParams.idBlog));

      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply()
    }

    $scope.getPostContent = function(post){
      if(post.content !== undefined) {
        post.content = undefined;
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
