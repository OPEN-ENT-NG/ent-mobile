angular
  .module("ent.blog_service", ["ent.request"])
  .service("BlogsService", function(domainENT, $q, RequestService) {
    this.getAllBlogs = function() {
      return RequestService.get(domainENT + "/blog/list/all");
    };

    this.getAllPostsByBlogId = function(id) {
      return RequestService.get(
        domainENT + "/blog/post/list/all/" + id + "?state=PUBLISHED"
      );
    };

    this.getBlog = function(id) {
      return RequestService.get(`${domainENT}/blog/${id}`);
    };

    this.getPostContentById = function(idBlog, idPost) {
      return RequestService.get(
        domainENT + "/blog/post/" + idBlog + "/" + idPost + "?state=PUBLISHED"
      );
    };

    this.getPostCommentsById = function(idBlog, idPost) {
      return RequestService.get(
        domainENT + "/blog/comments/" + idBlog + "/" + idPost
      );
    };

    this.getAuthors = function(posts) {
      var promisesAuthors = [];
      var deferredCombinedItemsAuthors = $q.defer();
      var combinedItemsAuthors = [];
      var uniqItemsAuthors = [];

      posts.forEach(function(item) {
        if (
          !uniqItemsAuthors.some(function(auth) {
            return auth == item.author.userId;
          })
        ) {
          uniqItemsAuthors.push(item.author.userId);
        }
      });

      uniqItemsAuthors.forEach(function(authId) {
        var deferredItemListAuthors = $q.defer();
        RequestService.get(
          domainENT + "/userbook/api/person?id=" + authId
        ).then(function(resp) {
          combinedItemsAuthors = combinedItemsAuthors.concat(
            resp.data.result[0]
          );
          deferredItemListAuthors.resolve();
        });
        promisesAuthors.push(deferredItemListAuthors.promise);
      });

      $q.all(promisesAuthors).then(function() {
        deferredCombinedItemsAuthors.resolve(combinedItemsAuthors);
      });
      return deferredCombinedItemsAuthors.promise;
    };

    this.getTranslation = function() {
      return RequestService.get(domainENT + "/blog/i18n");
    };

    this.commentPostById = function(idBlog, idPost, comment) {
      return RequestService.post(
        domainENT + "/blog/comment/" + idBlog + "/" + idPost,
        { comment: comment }
      );
    };

    this.editComment = function(idBlog, idPost, idComment, comment) {
      return RequestService.put(
        `${domainENT}/blog/comment/${idBlog}/${idPost}/${idComment}`,
        { comment },
        { headers: { "content-type": "application/json" } }
      );
    };

    this.deleteComment = function(idBlog, idPost, idComment) {
      return RequestService.delete(
        `${domainENT}/blog/comment/${idBlog}/${idPost}/${idComment}`
      );
    };
  });
