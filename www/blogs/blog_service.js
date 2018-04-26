angular.module('ent.blog_service', [])
.service('BlogsService', function($http, domainENT, $q){

  this.getAllBlogs = function () {
    return $http.get(domainENT+"/blog/list/all");
  }

  this.getAllPostsByBlogId = function(id){
    return $http.get(domainENT+"/blog/post/list/all/"+id+"?state=PUBLISHED");
  }

  this.getPostContentById = function(idBlog, idPost){
    return $http.get(domainENT + "/blog/post/" + idBlog + "/" + idPost + "?state=PUBLISHED");
  }

  this.getPostCommentsById = function (idBlog, idPost) {
    return $http.get(domainENT + "/blog/comments/" + idBlog + "/" + idPost);
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

  this.getTraduction = function(){
    return $http.get(domainENT+"/blog/i18n");
  }

  this.commentPostById = function (idBlog, idPost, comment) {
      return $http.post(domainENT+'/blog/comment/' + idBlog + '/' + idPost, {'comment': comment});
    };
})
