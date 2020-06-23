angular
  .module("ent.blog_service", ["ent.request"])
  .service("BlogsService", function (domainENT, $q, RequestService) {
    this.getAllBlogs = function () {
      return RequestService.get(domainENT + "/blog/list/all");
    };

    this.getAllPostsByBlogId = function (id) {
      return RequestService.get(domainENT + "/blog/post/list/all/" + id, {
        state: "PUBLISHED",
      });
    };

    this.getBlog = function (id) {
      return RequestService.get(`${domainENT}/blog/${id}`);
    };

    this.getPostContentById = function (idBlog, idPost) {
      return RequestService.get(
        domainENT + "/blog/post/" + idBlog + "/" + idPost,
        {
          state: "PUBLISHED",
        }
      );
    };

    this.getPostCommentsById = function (idBlog, idPost) {
      return RequestService.get(
        domainENT + "/blog/comments/" + idBlog + "/" + idPost
      );
    };

    this.getAuthors = function (posts) {
      const uniqAuthors = posts
        .map(function (post) {
          return post.author.userId;
        })
        .reduce(function (tempUniqAuthors, author) {
          if (!tempUniqAuthors.includes(author)) {
            tempUniqAuthors.push(author);
          }
          return tempUniqAuthors;
        }, []);

      return $q.all(
        uniqAuthors.map(function (author) {
          return RequestService.get(domainENT + "/userbook/api/person", {
            id: author,
          }).then(function (resp) {
            return resp.data.result[0];
          });
        })
      );
    };

    this.getTranslation = function () {
      return RequestService.get(domainENT + "/blog/i18n");
    };

    this.commentPostById = function (idBlog, idPost, comment) {
      return RequestService.post(
        domainENT + "/blog/comment/" + idBlog + "/" + idPost,
        null,
        { comment: comment }
      );
    };

    this.editComment = function (idBlog, idPost, idComment, comment) {
      return RequestService.put(
        `${domainENT}/blog/comment/${idBlog}/${idPost}/${idComment}`,
        null,
        { comment },
        { headers: { "content-type": "application/json" } }
      );
    };

    this.deleteComment = function (idBlog, idPost, idComment) {
      return RequestService.delete(
        `${domainENT}/blog/comment/${idBlog}/${idPost}/${idComment}`
      );
    };
  });
