angular
  .module("ent.blog", ["ent.blog_service"])

  .controller("BlogCtrl", function (
    $scope,
    $ionicPlatform,
    BlogsService,
    $stateParams,
    $rootScope,
    $ionicLoading,
    $location,
    PopupFactory,
    $ionicPopup,
    $ionicScrollDelegate
  ) {
    $ionicPlatform.ready(function () {
      $scope.$on("$ionicView.enter", function () {
        if ($stateParams.idBlog) {
          BlogsService.getBlog($stateParams.idBlog).then(({ data }) => {
            $scope.blog = data;
            getPosts(data._id).then(() => {
              if ($stateParams.idPost) {
                $scope.getPostContent(
                  $scope.posts.find((post) => post._id == $stateParams.idPost)
                );
              }
            });
          });
        }
      });
    });

    $scope.getCountComments = function (post) {
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
    $scope.toggleComments = function (post) {
      $scope.shownComments = $scope.areCommentsShown(post) ? null : post;
      $ionicScrollDelegate.resize();
    };

    $scope.areCommentsShown = function (post) {
      return $scope.shownComments === post;
    };

    $scope.commentPost = function (post) {
      let myPopup = PopupFactory.getPromptPopup(
        $rootScope.translationBlog["blog.comment"],
        null,
        $rootScope.translationBlog["cancel"],
        $rootScope.translationBlog["blog.comment"]
      );

      myPopup.then(function (res) {
        if (res) {
          $ionicLoading.show({
            template: '<ion-spinner icon="android"/>',
          });
          BlogsService.commentPostById($scope.blog._id, post._id, res)
            .then(() => {
              BlogsService.getPostCommentsById($scope.blog._id, post._id)
                .then((res) => (post.comments = res.data))
                .catch(() => (post.comments = []));
            })
            .finally($ionicLoading.hide);
        }
      });
    };

    $scope.editComment = (post, comment) => {
      let scope = $scope.$new(true);
      scope.data = { response: comment.comment };
      $ionicPopup

        .show({
          title: $rootScope.translationBlog["blog.comment"],
          scope,
          template: '<textarea rows="10" ng-model="data.response">',
          buttons: [
            {
              text: $rootScope.translationBlog["cancel"],
              type: "button-default",
              onTap: function () {},
            },
            {
              text: $rootScope.translationBlog["blog.comment"],
              type: "button-positive",
              onTap: function () {
                return scope.data.response || "";
              },
            },
          ],
        })
        .then(function (res) {
          if (res) {
            $ionicLoading.show({
              template: '<ion-spinner icon="android"/>',
            });
            BlogsService.editComment($scope.blog._id, post._id, comment.id, res)
              .then(() => {
                BlogsService.getPostCommentsById($scope.blog._id, post._id)
                  .then((res) => (post.comments = res.data))
                  .catch(() => (post.comments = []));
              })
              .catch(PopupFactory.getCommonAlertPopup)
              .finally($ionicLoading.hide);
          }
        });
    };

    $scope.deleteComment = (post, comment) => {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      BlogsService.deleteComment($scope.blog._id, post._id, comment.id)
        .then(() => {
          BlogsService.getPostCommentsById($scope.blog._id, post._id)
            .then((res) => (post.comments = res.data))
            .catch(() => (post.comments = []));
        })
        .finally($ionicLoading.hide);
    };

    $scope.hasRightToDeleteComment = function (comment) {
      var manageBlog = () => {
        let rights = $scope.blog.shared.find(
          (share) => share.userId == $rootScope.myUser.userId
        );
        return (
          !!rights &&
          rights["org-entcore-blog-controllers-BlogController|delete"]
        );
      };

      return (
        comment.author.userId == $rootScope.myUser.userId ||
        $scope.blog.author.userId == $rootScope.myUser.userId ||
        manageBlog()
      );
    };

    $scope.hasRightToComment = function () {
      if ($scope.blog.author.userId == $rootScope.myUser.userId) {
        return true;
      } else {
        for (var i = 0; i < $scope.blog.shared.length; i++) {
          if (
            ($scope.blog.shared[i]["userId"] == $rootScope.myUser.userId ||
              $rootScope.myUser.groupsIds.some(function (id) {
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

    $scope.doRefreshPosts = function () {
      $scope.posts.unshift(getPosts($scope.blog._id));

      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.getPostImage = function (post) {
      return post.author.photo;
    };

    $scope.getPostContent = function (post) {
      if (post.content !== undefined) {
        post.content = undefined;
        return;
      }
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      return BlogsService.getPostContentById($scope.blog._id, post._id)
        .then((res) => {
          post.content = res.data.content;
          return BlogsService.getPostCommentsById($scope.blog._id, post._id)
            .then(({ data }) => (post.comments = data))
            .catch(() => (post.comments = []));
        })
        .catch(() => (post.content = null))
        .finally(() => {
          $ionicLoading.hide();
          $ionicScrollDelegate.resize();
        });
    };

    function getPosts(id) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      $scope.posts = [];

      return BlogsService.getAllPostsByBlogId(id).then(
        function (res) {
          $scope.posts = res.data;
          $ionicLoading.hide();
          if ($scope.posts.length !== 0) {
            BlogsService.getAuthors($scope.posts).then(function (resAuthors) {
              $scope.posts.forEach(function (post) {
                const foundAuthor = resAuthors.find(function (author) {
                  author.userId == post.author.userId;
                });
                post.author.photo =
                  foundAuthor &&
                  foundAuthor.photo &&
                  foundAuthor.photo != "no-avatar.jpg"
                    ? foundAuthor.photo
                    : "/userbook/avatar/" + post.author.userId;
              });

              if ($stateParams.idPost) {
                $location.hash($stateParams.idPost);
              }
            });
          } else {
            $scope.noPost = true;
          }
        },
        function () {
          $ionicLoading.hide();
          $scope.noPost = true;
        }
      );
    }
  });
