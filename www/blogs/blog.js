angular
  .module("ent.blog", ["ent.blog_service"])

  .controller("BlogCtrl", function(
    $scope,
    $ionicPlatform,
    BlogsService,
    $stateParams,
    $rootScope,
    $ionicLoading,
    $location,
    PopupFactory
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        if ($stateParams.idBlog) {
          BlogsService.getBlog($stateParams.idBlog).then(({ data }) => {
            $scope.blog = data;
            getPosts(data._id).then(() => {
              if ($stateParams.idPost) {
                $scope.getPostContent(
                  $scope.posts.find(post => post._id == $stateParams.idPost)
                );
              }
            });
          });
        }
      });
    });

    $scope.getCountComments = function(post) {
      if (post.comments != null) {
        var size = post.comments.length;
        var unite = size == 1 ? "Commentaire" : "Commentaires";
        return size + " " + unite;
      }
    };

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

    $scope.commentPost = function(post) {
      $scope.data = {};

      if ($scope.isRightToComment()) {
        let myPopup = PopupFactory.getPromptPopup(
          $rootScope.translationBlog["blog.comment"],
          null,
          "<b>" + $rootScope.translationBlog["blog.comment"] + "</b>"
        );

        $ionicPlatform.registerBackButtonAction(function(e) {
          myPopup.close();
        }, 1001);

        myPopup.then(function(res) {
          if (res) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"/>'
            });
            BlogsService.commentPostById($scope.blog._id, post._id, res).then(
              function(result) {
                BlogsService.getPostCommentsById(
                  $scope.blog._id,
                  post._id
                ).then(
                  function(res) {
                    post.comments = res.data;
                    $ionicLoading.hide();
                  },
                  function(err) {
                    post.comments = [];
                    $ionicLoading.hide();
                  }
                );
                $ionicLoading.hide();
              },
              function() {
                $ionicLoading.hide();
              }
            );
          }
        });
      }
    };

    $scope.isRightToComment = function() {
      if ($scope.blog.author.userId == $rootScope.myUser.userId) {
        return true;
      } else {
        for (var i = 0; i < $scope.blog.shared.length; i++) {
          if (
            ($scope.blog.shared[i]["userId"] == $rootScope.myUser.userId ||
              $rootScope.myUser.groupsIds.some(function(id) {
                return id == $scope.blog.shared[i]["groupId"];
              })) &&
            $scope.blog.shared[i][
              "org-entcore-blog-controllers-PostController|comment"
            ]
          ) {
            return true;
          }
        }
      }
      return false;
    };

    $scope.doRefreshPosts = function() {
      $scope.posts.unshift(getPosts($scope.blog._id));

      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.getPostContent = function(post) {
      if (post.content !== undefined) {
        post.content = undefined;
        return;
      }
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      return BlogsService.getPostContentById($scope.blog._id, post._id).then(
        function(res) {
          post.content = res.data.content;
          return BlogsService.getPostCommentsById(
            $scope.blog._id,
            post._id
          ).then(
            function(res) {
              post.comments = res.data;
              $ionicLoading.hide();
            },
            function() {
              post.comments = [];
              $ionicLoading.hide();
            }
          );
        },
        function() {
          post.content = null;
          $ionicLoading.hide();
        }
      );
    };

    function getPosts(id) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      $scope.posts = [];

      return BlogsService.getAllPostsByBlogId(id).then(
        function(res) {
          $scope.posts = res.data;
          $ionicLoading.hide();
          if ($scope.posts.length !== 0) {
            BlogsService.getAuthors($scope.posts).then(function(resAuthors) {
              for (var i = 0; i < $scope.posts.length; i++) {
                let auth = resAuthors.find(
                  auth => auth && auth.id == $scope.posts[i].author.userId
                );
                $scope.posts[i].author.photo = setProfileImage(
                  auth ? auth.photo : null,
                  $scope.posts[i].author.userId
                );
              }

              if ($stateParams.idPost) {
                $location.hash($stateParams.idPost);
              }
            });
          } else {
            $scope.noPost = true;
          }
        },
        function() {
          $ionicLoading.hide();
          $scope.noPost = true;
        }
      );
    }
  });
