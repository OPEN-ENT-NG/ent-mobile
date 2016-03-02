angular.module('ent.blog_service', [])
.service('BlogsService', function($http, domainENT, $q){

  this.getAllBlogs = function () {
    return $http.get(domainENT+"/blog/list/all");
  }

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
    return  [
      {
        name: "filters.submitted",
        id: "SUBMITTED"
      },
      {
        name: "filters.drafts",
        id: "DRAFT"
      },
      {
        name: "filters.published",
        id: "PUBLISHED"
      }];
    // return  ["SUBMITTED", "DRAFT", "PUBLISHED"];
    }

    this.getTraduction = function(){
      return $http.get(domainENT+"/blog/i18n");
    }

  })
