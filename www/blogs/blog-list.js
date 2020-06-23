angular
  .module("ent.blog-list", ["ent.blog_service"])

  .controller("BlogListCtrl", function (
    $ionicPlatform,
    $scope,
    $state,
    BlogsService,
    $ionicLoading,
    domainENT
  ) {
    $ionicPlatform.ready(function () {
      $scope.$on("$ionicView.enter", function () {
        getListBlogs();
      });
    });

    $scope.goToBlog = function (blog) {
      $state.go("app.blog", { idBlog: blog._id });
    };

    $scope.doRefreshBlogs = function () {
      $scope.blogs.unshift(getListBlogs());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
    };

    $scope.getBlogThumbnail = function (blog) {
      return (
        blog.thumbnail || "/assets/themes/paris/img/illustrations/blog.png"
      );
    };

    function getListBlogs() {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>',
      });
      $scope.blogs = [];
      BlogsService.getAllBlogs()
        .then(function (resp) {
          $scope.blogs = resp.data;
        })
        .finally($ionicLoading.hide);
    }
  });
