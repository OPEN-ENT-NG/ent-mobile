angular
  .module("ent.blog-list", ["ent.blog_service"])

  .controller("BlogListCtrl", function(
    $ionicPlatform,
    $scope,
    $rootScope,
    $state,
    BlogsService,
    $ionicLoading
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        getListBlogs();
      });
    });

    $scope.goToBlog = function(blog) {
      $state.go("app.blog", { idBlog: blog._id });
    };

    $scope.doRefreshBlogs = function() {
      $scope.blogs.unshift(getListBlogs());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    function getListBlogs() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      $scope.blogs = [];
      BlogsService.getAllBlogs().then(
        function(resp) {
          $scope.blogs = resp.data;
          for (var i = 0; i < $scope.blogs.length; i++) {
            $scope.blogs[i].thumbnail = $scope.setCorrectImage(
              $scope.blogs[i].thumbnail,
              "/../../../img/illustrations/blog-default.png"
            );
          }
          $ionicLoading.hide();
        },
        function() {
          $ionicLoading.hide();
        }
      );
    }
  });
