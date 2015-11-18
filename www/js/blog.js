angular.module('ent.blog', [])

.factory('serviceBlog', function(){

  var store = {},
  self = {};

  self.getAllBlogs = function() {
    if (!store.blogs) {
      store.blogs = [
        {
          id: 1,
          icon: "ion-calendar",
          titre: "Life Skills end course",
          auteur: "me"
        },
        {
          id: 2,
          icon: "ion-calendar",
          titre: "Women and sports",
          auteur: "myself"
        },
        {
          id: 3,
          icon: "ion-calendar",
          titre: "Development and sports",
          auteur: "coco"
        }
      ]
    }
    return store.blogs;
  };

  self.getBlog = function(index){
    return self.getAllBlogs()[index] || undefined;
  };
  return self;
})

.controller('BlogListCtrl', function($scope, $state, blogs) {
  $scope.blogs = blogs;
})

.controller('BlogCtrl', function($scope, blog) {
  $scope.blog = blog;
})
;
