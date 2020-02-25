angular
  .module("ent.notificationService", ["ent.request"])
  .service("NotificationService", function(
    domainENT,
    $q,
    $state,
    RequestService
  ) {
    this.notificationHandler = function(
      type,
      { idMessage, idActu, idPost, idBlog, uri }
    ) {
      switch (type) {
        case "MESSAGERIE":
          $state.go("app.message_detail", {
            nameFolder: "INBOX",
            idMessage
          });
          break;
        case "NEWS":
          $state.go("app.actualites", {
            idActu
          });
          break;
        case "BLOG":
          $state.go("app.blog", {
            idPost,
            idBlog
          });
          break;
        case "WORKSPACE":
          $state.go("app.workspace_tree", {
            filter: "shared"
          });
          break;
        default:
          window.open(
            domainENT +
              "/auth/login?callBack=" +
              encodeURIComponent(domainENT + uri),
            "_system"
          );
      }
    };

    this.pushNotificationHandler = function(notif) {
      let params = JSON.parse(notif.params);
      let module = /\/([\w]+)\W?/g.exec(params.resourceUri)[1];

      let serviceType = "";
      let serviceParams = {};

      switch (module) {
        case "blog": {
          serviceType = "BLOG";
          let ids = params.resourceUri.split("/");
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
          serviceParams.idMessage = params.messageUri.split("/").pop();
          break;
        }
        case "actualites": {
          serviceType = "NEWS";
          serviceParams.idActu = params.resourceUri.split("/").pop();
          break;
        }
        default: {
          serviceParams.uri = params.resourceUri;
        }
      }

      this.notificationHandler(serviceType, serviceParams);
    };

    this.setFcmToken = token => {
      var url = domainENT + "/timeline/pushNotif/fcmToken?fcmToken=" + token;
      return RequestService.put(url).then(
        function() {
          localStorage.setItem("fcmToken", token);
        },
        function(error) {
          throw error;
        }
      );
    };

    this.deleteFcmToken = function() {
      return $q(function(resolve, reject) {
        var fcmToken = localStorage.getItem("fcmToken");
        if (fcmToken != null) {
          RequestService.delete(
            `${domainENT}/timeline/pushNotif/fcmToken?fcmToken=${fcmToken}`
          ).then(resolve, reject);
        } else {
          resolve();
        }
      });
    };

    this.setPermission = callback => {
      window.FirebasePlugin.hasPermission(isEnabled => {
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
