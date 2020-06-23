angular
  .module("ent.notificationService", ["ent.request"])
  .service("NotificationService", function (
    domainENT,
    $q,
    $state,
    RequestService
  ) {
    this.notificationHandler = function (
      type,
      { idMessage, idActu, idPost, idBlog, uri }
    ) {
      switch (type) {
        case "MESSAGERIE": {
          $state.go("app.message_detail", {
            nameFolder: "INBOX",
            idMessage,
          });
          break;
        }
        case "NEWS": {
          $state.go("app.actualites", {
            idActu,
          });
          break;
        }
        case "BLOG": {
          $state.go("app.blog", {
            idPost,
            idBlog,
          });
          break;
        }
        case "WORKSPACE": {
          $state.go("app.workspace_tree", {
            filter: "shared",
          });
          break;
        }
        case "TIMELINE": {
          $state.go("app.timeline_list", {}, { reload: true });
          break;
        }
        default: {
          window.open(
            domainENT +
              "/auth/login?callBack=" +
              encodeURIComponent(domainENT + uri),
            "_system"
          );
        }
      }
    };

    this.pushNotificationHandler = function (notif) {
      let { resourceUri, messageUri } = JSON.parse(notif.params);
      let module = resourceUri
        ? /\/([\w]+)\W?/g.exec(resourceUri)[1]
        : "timeline";

      let serviceType = "";
      let serviceParams = {};

      switch (module) {
        case "blog": {
          serviceType = "BLOG";
          let ids = resourceUri.split("/");
          serviceParams.idPost = ids.pop();
          serviceParams.idBlog = ids.pop();
          break;
        }
        case "workspace": {
          serviceType = "WORKSPACE";
          break;
        }
        case "conversation": {
          serviceType = "MESSAGERIE";
          serviceParams.idMessage = messageUri.split("/").pop();
          break;
        }
        case "actualites": {
          serviceType = "NEWS";
          serviceParams.idActu = resourceUri.split("/").pop();
          break;
        }
        case "timeline": {
          serviceType = "TIMELINE";
        }
        default: {
          serviceParams.uri = resourceUri;
        }
      }

      this.notificationHandler(serviceType, serviceParams);
    };

    this.setFcmToken = (token) => {
      return RequestService.put(
        `${domainENT}/timeline/pushNotif/fcmToken`,
        {
          fcmToken: token,
        }
      ).then(function () {
        localStorage.setItem("fcmToken", token);
      });
    };

    this.deleteFcmToken = function () {
      return $q(function (resolve, reject) {
        var fcmToken = localStorage.getItem("fcmToken");
        if (fcmToken != null) {
          RequestService.delete(`${domainENT}/timeline/pushNotif/fcmToken`, {
            fcmToken,
          }).then(resolve, reject);
        } else {
          resolve();
        }
      });
    };

    this.setPermission = (callback) => {
      window.FirebasePlugin.hasPermission((isEnabled) => {
        console.log("IOS: has firebase permission ? " + isEnabled);
        if (!isEnabled) {
          window.FirebasePlugin.grantPermission(() => {
            console.log("IOS: Permission granted");
            callback();
          });
        }
      });
    };
  });
