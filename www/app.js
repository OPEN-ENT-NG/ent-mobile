angular
  .module("ent", [
    "ionic",
    "ngCordova",
    "ent.actualites",
    "ent.blog",
    "ent.blog-list",
    "ent.authentication",
    "ent.messagerie",
    "ent.workspace",
    "ent.pronotes",
    "ent.support",
    "ng-mfb",
    "ent.timeline",
    "angular.img",
    "ent.request",
    "ent.firstConnection",
    "ent.firstConnectionService",
    "ent.forgotLoginPwd",
    "ent.forgotLoginPwdService",
    "ent.profile",
    "ent.notificationService"
  ])

  .config(function($stateProvider, $ionicConfigProvider, $httpProvider) {
    $httpProvider.defaults.withCredentials = true;

    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.backButton.text("").previousTitleText(false);

    $stateProvider
      .state("app", {
        abstract: true,
        templateUrl: "menu.html",
        controller: "AppCtrl"
      })

      .state("app.messagerie", {
        xitiIndex: "messagerie",
        templateUrl: "messagerie/folder_view.html",
        controller: "MessagerieFoldersCtrl"
      })

      .state("app.message_folder", {
        params: {
          nameFolder: "",
          idFolder: ""
        },
        cache: false,
        templateUrl: "messagerie/folder_content.html",
        controller: "InboxCtrl"
      })

      .state("app.message_detail", {
        params: {
          nameFolder: "",
          idMessage: ""
        },
        templateUrl: "messagerie/detail.html",
        controller: "MessagesDetailCtrl"
      })

      .state("app.new_message", {
        cache: false,
        params: {
          prevMessage: null,
          action: null
        },
        templateUrl: "messagerie/new_message.html",
        controller: "NewMessageCtrl"
      })

      .state("app.blog-list", {
        xitiIndex: "blog",
        templateUrl: "blogs/blog-list.html",
        controller: "BlogListCtrl"
      })

      .state("app.blog", {
        params: {
          idBlog: "",
          idPost: ""
        },
        templateUrl: "blogs/blog.html",
        controller: "BlogCtrl"
      })

      .state("app.timeline_list", {
        cache: false,
        templateUrl: "timeline/timeline.html",
        controller: "TimelineCtrl"
      })

      .state("app.timeline_prefs", {
        templateUrl: "timeline/timeline_filter.html",
        controller: "TimelineCtrl"
      })

      .state("app.actualites", {
        xitiIndex: "actualites",
        cache: false,
        params: {
          idActu: null
        },
        templateUrl: "actualites/actualites.html",
        controller: "ActualitesCtrl"
      })

      .state("app.threads", {
        templateUrl: "actualites/threads.html",
        controller: "ActualitesCtrl"
      })

      .state("app.listPronotes", {
        templateUrl: "pronotes/listPronotes.html",
        controller: "PronoteCtrl"
      })

      .state("app.pronote", {
        xitiIndex: "pronotes",
        params: { link: "" },
        templateUrl: "pronotes/pronote.html",
        controller: "PronoteCtrl"
      })

      .state("app.workspace", {
        xitiIndex: "workspace",
        templateUrl: "workspace/workspace.html"
      })

      .state("app.workspace_tree", {
        params: {
          filter: null,
          folderId: null,
          folderName: null,
          idDoc: null
        },
        controller: "WorkspaceFolderContentCtlr",
        templateUrl: "workspace/tree.html"
      })

      .state("app.workspace_file", {
        params: {
          filter: null,
          file: null,
          folderName: null
        },
        controller: "WorkspaceFileCtlr",
        templateUrl: "workspace/file.html"
      })

      // .state("app.workspace_file_versions", {
      //   url: "/workspace/file/versions/",
      //   views: {
      //     "menuContent@app": {
      //       controller: "FileVersionCtrl",
      //       templateUrl: "workspace/file_versions.html"
      //     }
      //   }
      // })

      .state("app.workspace_movecopy", {
        params: {
          action: null,
          items: null
        },
        templateUrl: "workspace/move_copy.html",
        controller: "MoveCopyCtrl"
      })

      .state("app.workspace_share", {
        params: {
          filter: null,
          ids: null
        },
        controller: "ShareItemController",
        templateUrl: "workspace/share.html"
      })

      .state("app.profile", {
        xitiIndex: "profile",
        controller: "ProfileCtrl",
        templateUrl: "profile/profile.html"
      })

      .state("app.support", {
        xitiIndex: "support",
        controller: "SupportCtrl",
        templateUrl: "support/support.html"
      })

      .state("login", {
        params: {
          prefill: false
        },
        templateUrl: "authentification/login-credentials.html",
        controller: "LoginCtrl",
        cache: false
      })

      .state("firstConnection", {
        templateUrl: "firstConnection/firstConnection.html",
        controller: "FirstConnectionCtrl"
      })

      .state("forgotLoginPwd", {
        templateUrl: "forgotLoginPwd/forgotLoginPwd.html",
        controller: "ForgotLoginPwdCtrl"
      });

    // .state("authLoading", {
    //   url: "/auth-loading",
    //   templateUrl: "authLoader/authLoader.html",
    //   controller: "AuthLoaderCtrl"
    // });
  })

  .run(function(
    $ionicPlatform,
    $rootScope,
    RequestService,
    $state,
    AuthenticationService,
    $timeout,
    UserFactory,
    NotificationService,
    TraductionService,
    WorkspaceService,
    PronoteService,
    PopupFactory
  ) {
    function intentHandler(intent) {
      if (
        intent &&
        intent.hasOwnProperty("action") &&
        intent.action == "android.intent.action.SEND"
      ) {
        var image = intent.extras["android.intent.extra.STREAM"];

        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });

        window.plugins.intent.getRealPathFromContentUrl(
          image,
          function(filepath) {
            window.resolveLocalFileSystemURL(
              "file://" + filepath,
              function(entry) {
                entry.file(function(file) {
                  if (
                    $rootScope.translationWorkspace &&
                    file.size > $rootScope.translationWorkspace["max.file.size"]
                  ) {
                    PopupFactory.getAlertPopupNoTitle(
                      $rootScope.translationWorkspace["file.too.large.limit"] +
                        $scope.getSizeFile(
                          parseInt(
                            $rootScope.translationWorkspace["max.file.size"]
                          )
                        )
                    );
                  } else {
                    var reader = new FileReader();

                    reader.onloadend = function() {
                      var formData = new FormData();
                      formData.append(
                        "file",
                        new Blob([this.result], { type: file.type }),
                        file.name
                      );

                      WorkspaceService.uploadDoc(formData).then(
                        function() {
                          $state.go("app.workspace_tree", {
                            filter: "owner"
                          });
                          $ionicLoading.hide();
                        },
                        function(err) {
                          $ionicLoading.hide();
                          console.log("upload failed");
                          $ionicLoading.hide();
                          PopupFactory.getCommonAlertPopup(err);
                        }
                      );
                    };
                    reader.readAsArrayBuffer(file);
                  }
                });
              },
              function(errdata) {
                console.log(errdata);
                $ionicLoading.hide();
              }
            );
          },
          function(errdata) {
            console.log(errdata);
            $ionicLoading.hide();
          }
        );
      }
    }

    $ionicPlatform.ready(function() {
      RequestService.setDefaultHeaders();

      if (window.StatusBar) {
        StatusBar.styleLightContent();
        StatusBar.overlaysWebView(false);
      }

      cordova.getAppVersion.getVersionNumber(function(version) {
        $rootScope.version = version;
      });

      cordova.getAppVersion.getAppName(function(name) {
        $rootScope.appName = name;
      });

      if (ionic.Platform.isIOS()) {
        NotificationService.setPermission(() => true);
        // console.log("IOS : Granted permission");
        // window.FirebasePlugin.grantPermission(function() {
        //   console.log("IOS: Permission granted");
        //   window.FirebasePlugin.hasPermission(function(data) {
        //     console.log("IOS: has firebase permission ? " + data.isEnabled);
        //   });
        // });
      }

      window.requestFileSystem =
        window.requestFileSystem || window.webkitRequestFileSystem;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

      $rootScope.$on("$cordovaNetwork:offline", function() {
        console.log("offline");
        $rootScope.status = "offline";
        $rootScope.$apply();
      });

      $rootScope.$on("$cordovaNetwork:online", function() {
        console.log("online");
        $rootScope.status = $rootScope.status == undefined ? null : "online";
        $rootScope.$apply();
      });

      $rootScope.$on("LoggedIn", () => {
        UserFactory.getUser().then(user => ($rootScope.myUser = user));

        PronoteService.getAllAccounts().then(function(resp) {
          if (resp.length > 0) {
            $rootScope.listMenu.unshift({
              name: "Version mobile",
              icon: "custom-pronote pronote-1icon-",
              state: "app.listPronotes"
              // href: "#/app/listPronotes"
            });
          }
        });

        TraductionService.getAllTranslation().then(
          () => {
            if (!ionic.Platform.isIOS()) {
              window.plugins.intent.setNewIntentHandler(intentHandler);
            }
          },
          err => PopupFactory.getCommonAlertPopup(err)
        );

        window.FirebasePlugin.onTokenRefresh(token => {
          NotificationService.setFcmToken(token);
        });

        cordova.plugins.notification.local.on("click", notification => {
          NotificationService.pushNotificationHandler(notification.data);
        });

        window.FirebasePlugin.onNotificationOpen(data => {
          if (data.tap) {
            NotificationService.pushNotificationHandler(data);
          } else {
            cordova.plugins.notification.local.schedule({
              text: data.body,
              title: data.title,
              data
            });
          }
        });
      });

      AuthenticationService.relog(
        () => {
          console.log("redirecting");
          $state.go("app.timeline_list");
          $timeout(navigator.splashscreen.hide, 500);
        },
        () => {
          $state.go("login");
          $timeout(navigator.splashscreen.hide);
        }
      );
    });
  })

  .controller("AppCtrl", function(
    $scope,
    $rootScope,
    $sce,
    $state,
    $ionicPlatform,
    $cordovaFile,
    $cordovaFileOpener2,
    domainENT,
    $ionicHistory,
    $filter,
    $http,
    $ionicLoading,
    PopupFactory,
    NotificationService
  ) {
    $scope.showGridMenu = false;

    $rootScope.filterThreads = [];

    $rootScope.listMenu = [
      {
        name: "Actualites",
        icon: "custom-newspaper newspapericon-",
        state: "app.actualites"
        // href: "#/app/actualites"
      },
      {
        name: "Blog",
        icon: "custom-bullhorn bullhornicon-",
        state: "app.blog-list"
        // href: "#/app/blog-list"
      },
      {
        name: "Documents",
        icon: "custom-folder foldericon-",
        state: "app.workspace"
        // href: "#/app/workspace"
      },
      {
        name: "Accès ENT Web",
        icon: "ent-link",
        state: domainENT
      },
      {
        name: "Assistance ENT",
        icon: "custom-help-circled help-circledicon-",
        state: "app.support"
      }
    ];

    $scope.hasBackView = () => {
      return !!$ionicHistory.backView();
    };

    $scope.doCustomBack = () => {
      if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else {
        $state.go("app.timeline_list");
      }
    };

    $scope.displayBar = function() {
      let regexp = RegExp("^app.*$");
      return regexp.test($state.current.name);
    };

    $scope.isHomeActive = function() {
      return $state.is("app.timeline_list") || $state.is("app.timeline_prefs");
    };

    $scope.isMessagerieActive = function() {
      return (
        $state.is("app.messagerie") ||
        $state.is("app.message_folder") ||
        $state.is("app.message_detail") ||
        $state.is("app.new_message")
      );
    };

    $scope.isGridActive = function() {
      return (
        $state.is("app.blog-list") ||
        $state.is("app.blog") ||
        $state.is("app.actualites") ||
        $state.is("app.threads") ||
        $state.is("app.listPronotes") ||
        $state.is("app.pronote") ||
        $state.is("app.workspace") ||
        $state.is("app.workspace_tree") ||
        $state.is("app.workspace_file") ||
        $state.is("app.workspace_movecopy") ||
        $state.is("app.workspace_share") ||
        $state.is("app.support")
      );
    };

    $scope.isProfileActive = function() {
      return $state.is("app.profile");
    };

    $scope.triggerGrid = function() {
      $scope.showGridMenu = !$scope.showGridMenu;
    };

    $scope.isGridHidden = function() {
      return !$scope.showGridMenu;
    };

    $scope.gridButton = function(state) {
      if (state.includes("http")) {
        $scope.openUrl(state);
      } else {
        $state.go(state);
      }
    };

    $rootScope.pick = function(object, keys) {
      var result = {};

      for (key of keys) {
        result[key] = object[key];
      }
      return result;
    };

    $rootScope.extend = function(dest, ...args) {
      for (let src of args) {
        var keys = $rootScope.allKeys(src);
        for (let key of keys) {
          dest[key] = src[key];
        }
      }
      return dest;
    };

    $rootScope.allKeys = function(obj) {
      var keys = [];
      for (var key in obj) keys.push(key);
      return keys;
    };

    $rootScope.downloadFile = function(fileName, urlFile) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });

      var filePath = ionic.Platform.isIOS()
        ? cordova.file.dataDirectory
        : cordova.file.externalRootDirectory + "Download/";

      var failure = function(err) {
        PopupFactory.getCommonAlertPopup(err);
        $ionicLoading.hide();
      };

      var checkFile = function() {
        $cordovaFile.checkFile(filePath, fileName).then(
          fileEntry => openFile(fileEntry),
          err => {
            if (err.code === 1) {
              downloadFile();
            } else {
              failure(err);
            }
          }
        );
      };

      var openFile = function(fileEntry) {
        fileEntry.file(file => {
          $scope.openLocalFile(file.localURL, file.type);
          $ionicLoading.hide();
        });
      };

      var downloadFile = function() {
        var config = {
          method: "GET",
          url: $sce.getTrustedResourceUrl($sce.trustAsResourceUrl(urlFile)),
          responseType: "arraybuffer",
          cache: true
        };

        $http(config).then(
          result => {
            if (result.status === 200 && result.data) {
              $cordovaFile
                .writeFile(
                  filePath,
                  fileName,
                  new Blob([new Uint8Array(result.data)], {
                    type: result.headers("content-type")
                  }),
                  true
                )
                .then(() => checkFile(), err => failure(err));
            }
          },
          err => failure(err)
        );
      };

      if (!ionic.Platform.isIOS()) {
        cordova.plugins.diagnostic.isExternalStorageAuthorized(bool => {
          if (bool) {
            checkFile();
          } else {
            cordova.plugins.diagnostic.requestExternalStorageAuthorization(
              result => {
                if (
                  result == cordova.plugins.diagnostic.permissionStatus.GRANTED
                ) {
                  checkFile();
                } else {
                  console.log("Permission Denied");
                }
              }
            );
          }
        }, console.log);
      } else {
        checkFile();
      }
    };

    $scope.openUrl = function(url) {
      var target = "_system";
      var ref = cordova.InAppBrowser.open($sce.trustAsUrl(url), target);

      ref.addEventListener("loadstart", loadstartCallback);
      ref.addEventListener("loadstop", loadstopCallback);
      ref.addEventListener("loaderror", loaderrorCallback);
      ref.addEventListener("exit", exitCallback);

      function loadstartCallback(event) {
        console.log("Loading started: " + event.url);
      }

      function loadstopCallback(event) {
        console.log("Loading finished: " + event.url);
      }

      function loaderrorCallback(error) {
        console.log("Loading error: " + error.message);
      }

      function exitCallback() {
        console.log("Browser is closed...");
      }
    };

    $scope.openLocalFile = function(targetPath, fileMIMEType) {
      $cordovaFileOpener2.open(targetPath, fileMIMEType, {
        error: function(error) {
          PopupFactory.getCommonAlertPopup(error);
        },
        success: function() {
          console.log("File displayed");
        }
      });
    };

    $scope.getImageUrl = function(path) {
      if (path) {
        return domainENT + (path.startsWith("/") ? path : "/" + path);
      }
    };

    $scope.getThumbnailUrl = function(path) {
      if (path) {
        return path;
      }
    };

    $scope.setCorrectImage = function(path, defaultImage) {
      var result;
      if (path != null && path.length > 0) {
        result = path;
      } else {
        if (
          !localStorage.getItem("skin") ||
          localStorage.getItem("skin") == "undefined"
        ) {
          // SkinFactory.getSkin().then(function(res) {
          localStorage.setItem("skin", "/assets/themes/paris/skins/default/");
          //          localStorage.setItem('skin', res.data.skin)
          console.log(localStorage.getItem("skin"));
          result = localStorage.getItem("skin") + defaultImage;
          // });
        } else {
          result = localStorage.getItem("skin") + defaultImage;
        }
      }
      return result;
    };

    $scope.formatDate = function(date) {
      let momentDate;
      if (date == null) {
        return "";
      } else if (moment.isMoment(date)) {
        momentDate = date;
      } else if (date.$date) {
        momentDate = moment(date.$date);
      } else if (typeof date === "number") {
        momentDate = moment.unix(date);
      } else {
        momentDate = moment(date);
      }

      return moment(momentDate).calendar();
    };

    $scope.formatDateLocale = function(date) {
      if (
        moment(date) >
          moment()
            .add(-1, "days")
            .startOf("day") &&
        moment(date) < moment().endOf("day")
      )
        return moment(date).calendar();

      if (
        moment(date) >
          moment()
            .add(-7, "days")
            .startOf("day") &&
        moment(date) < moment().endOf("day")
      )
        return moment(date).fromNow(); //this week

      return moment(date).format("L");
    };

    $scope.getSizeFile = function(size) {
      return $filter("bytes")(size);
    };

    $scope.logout = function() {
      window.FirebasePlugin.unregister(() => {
        NotificationService.deleteFcmToken().then(() => {
          localStorage.clear();
          $ionicHistory.clearHistory();
          $ionicHistory.clearCache();
          $state.go("login");
          location.reload();
        });
      });
    };

    $scope.openPopover = function($event) {
      $rootScope.popover.show($event);
    };

    $scope.closePopover = function() {
      $rootScope.popover.hide();
    };

    $ionicPlatform.ready(function() {
      $rootScope.$on("$stateChangeStart", function(event, toState) {
        $scope.showGridMenu = false;
      });

      document.addEventListener("click", function(event) {
        var regexp = /menu-grid|item-content/;
        if (
          !regexp.test(event.target.className) &&
          event.target.className.indexOf("apps-menu-button") === -1
        ) {
          $scope.showGridMenu = false;
          $scope.$apply();
        }
      });

      //SkinFactory.getSkin().then(function(res) {
      // localStorage.setItem("skin", "/assets/themes/paris/skins/default/");
      //localStorage.setItem('skin', res.data.skin);
      //} , function(err){
      //  PopupFactory.getCommonAlertPopup(err);
      //});
    });
  })

  .service("TraductionService", function(
    $rootScope,
    $q,
    ActualitesService,
    MessagerieServices,
    BlogsService,
    WorkspaceService,
    ProfileService
  ) {
    function getTranslationActualites() {
      return ActualitesService.getTranslation().then(
        ({ data }) => ($rootScope.translationActus = data)
      );
    }

    function getTranslationUser() {
      return ProfileService.getTranslation().then(
        ({ data }) => ($rootScope.translationUser = data)
      );
    }

    function getTranslationConversation() {
      return MessagerieServices.getTranslation().then(
        ({ data }) => ($rootScope.translationConversation = data)
      );
    }

    function getTraductionBlogs() {
      return BlogsService.getTraduction().then(function(resp) {
        $rootScope.translationBlog = resp.data;
        $rootScope.translationBlog[
          "filters.drafts"
        ] = $rootScope.translationBlog["filters.drafts"].substring(
          0,
          $rootScope.translationBlog["filters.drafts"].indexOf("(") - 1
        );
        $rootScope.translationBlog[
          "filters.submitted"
        ] = $rootScope.translationBlog["filters.submitted"].substring(
          0,
          $rootScope.translationBlog["filters.submitted"].indexOf("(") - 1
        );
      });
    }

    function getTraductionWorkspace() {
      return WorkspaceService.getTranslation().then(
        ({ data }) => ($rootScope.translationWorkspace = data)
      );
    }

    this.getAllTranslation = function() {
      return $q.all([
        getTranslationActualites(),
        getTranslationUser(),
        getTranslationConversation(),
        getTraductionBlogs(),
        getTraductionWorkspace()
      ]);
    };
  })

  .factory("PopupFactory", function($ionicHistory, $ionicPopup) {
    this.getConfirmPopup = function(title, template, cancelText, okText) {
      return $ionicPopup.confirm({
        title: title,
        template: template,
        cancelText: cancelText,
        okText: okText
      });
    };

    this.getAlertPopup = function(title, template) {
      return $ionicPopup.alert({
        title: title,
        template: template
      });
    };

    this.getAlertPopupNoTitle = function(template) {
      return $ionicPopup.alert({
        template: template,
        cssClass: "dismiss-title" // Hide title
      });
    };

    this.getPromptPopup = function(title, subtitle, okText) {
      return $ionicPopup.prompt({
        title,
        subtitle,
        okText
      });
    };

    this.getCommonAlertPopup = function(error) {
      console.log(error);
      var isPermissions = false;
      var title = "Erreur de connexion";
      var template =
        "Nous recontrons actuellement des problèmes. Veuillez réessayer dans quelques instants.";
      if (error) {
        if (error.hasOwnProperty("status")) {
          switch (error.status) {
            case 401:
              title = "Oups !";
              template = "Vous n'avez pas le droit d'accéder à ce contenu.";
              break;
            default:
          }
        }
        if (error.hasOwnProperty("http_status")) {
          switch (error.http_status) {
            case 200:
              isPermissions = true;
              title = "Oups !";
              template = "Vous n'avez pas validé les permission de stockage";
              break;
            default:
          }
        }

        let alertPopup = $ionicPopup.alert({
          title: title,
          template: template
        });

        alertPopup.then(function(res) {
          console.log(res);
          console.log(isPermissions);
          if (isPermissions) {
            console.log(cordova.plugins.diagnostic);
            cordova.plugins.diagnostic.requestRuntimePermissions(
              function(status) {
                console.log(status);
                switch (status) {
                  case cordova.plugins.diagnostic.permissionStatus
                    .NOT_REQUESTED:
                    console.log("Permission not requested");
                    break;
                  case cordova.plugins.diagnostic.permissionStatus.DENIED:
                    console.log("Permission denied");
                    break;
                  case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                    console.log("Permission granted always");
                    break;
                  case cordova.plugins.diagnostic.permissionStatus
                    .GRANTED_WHEN_IN_USE:
                    console.log("Permission granted only when in use");
                    break;
                }
              },
              function(error) {
                console.error(error);
              },
              cordova.plugins.diagnostic.runtimePermissionGroups.STORAGE
            );
          } else {
            if (
              !!$ionicHistory.backView() &&
              $ionicHistory.backView().stateName != "login" &&
              $ionicHistory.backView().stateName != "firstConnection"
            ) {
              $ionicHistory.goBack();
            }
          }
        });
      }
    };

    return this;
  })

  .directive("spinnerButton", function() {
    return {
      restrict: "E",
      transclude: true,
      replace: true,
      scope: {
        loading: "=",
        click: "&",
        disabled: "=",
        cssClass: "=",
        cssStyle: "="
      },
      template:
        '<button class="{{cssClass}}" style="{{cssStyle}}" ng-disabled="disabled || loading" ng-click="click()">' +
        '<div class="spinner-container" style="" ng-show="loading"><ion-spinner icon="android">&nbsp;</ion-spinner></div><ng-transclude></ng-transclude>' +
        "</button>"
    };
  })

  .directive("onLongPress", function($timeout) {
    return {
      restrict: "A",
      link: function($scope, $elm, $attrs) {
        $elm.bind("touchstart", function(evt) {
          // Locally scoped variable that will keep track of the long press
          $scope.longPress = true;

          // We'll set a timeout for 600 ms for a long press
          $timeout(function() {
            if ($scope.longPress) {
              // If the touchend event hasn't fired,
              // apply the function given in on the element's on-long-press attribute
              $scope.$apply(function() {
                $scope.$eval($attrs.onLongPress);
              });
            }
          }, 800);
        });
        $elm.bind("touchend", function(evt) {
          // Prevent the onLongPress event from firing
          $scope.longPress = false;
          // If there is an on-touch-end function attached to this element, apply it
          if ($attrs.onTouchEnd) {
            $scope.$apply(function() {
              $scope.$eval($attrs.onTouchEnd);
            });
          }
        });
      }
    };
  })

  .filter("bytes", function() {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return "-";
      if (typeof precision === "undefined") precision = 1;
      var units = ["bytes", "kB", "MB", "GB", "TB", "PB"],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (
        (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +
        " " +
        units[number]
      );
    };
  })

  .directive("renderHtml", function($compile, $sce, domainENT) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        let data = angular.copy(attrs.renderHtml);
        if (data != null) {
          data = data.replace(
            /href="([\/\w\d-]+)"><div class="download"><\/div>(.+)<\/a>/g,
            `ng-click="downloadFile('$2', '${domainENT}$1')"><div class="download"></div>$2</a>`
          );
          data = data.replace(
            /href=(["'])(.*?)\1/g,
            "ng-click=\"openUrl('$2')\""
          );
          data = data.replace(
            /<img src="(http(s?):\/\/[\S]+)"/g,
            '<img http-src="$1"'
          );
          data = data.replace(
            /<img src="(\/[\S]+)"/g,
            '<img http-src="' + domainENT + '$1" '
          );
          $compile(element.html($sce.trustAsHtml(data)).contents())(scope);
        }
      }
    };
  })

  .directive("offline", function() {
    return {
      restrict: "E",
      transclude: true,
      template:
        '<div class="offline-message {{status}}" ng-if="message">' +
        "<i class='fa fa-plug plug' ng-if=\"status != 'offline'\"></i>" +
        "<span>{{message}}</span>" +
        "</div>",
      controller: [
        "$scope",
        "$rootScope",
        "$timeout",
        function($scope, $rootScope, $timeout) {
          $rootScope.$watch("status", function(val) {
            $timeout(function() {
              if (val === "offline") {
                $scope.message = "Pas de connexion";
              } else if (val === "online") {
                $scope.message = "Connecté";
              }

              $timeout(function() {
                $scope.message = null;
              }, 5000);
            });
          });
        }
      ]
    };
  })

  .directive("xiti", function(
    RequestService,
    $rootScope,
    domainENT,
    $rootScope,
    xitiIndex,
    UserFactory
  ) {
    return {
      restrict: "E",
      replace: false,
      scope: false,
      compile: function(element, attributes) {
        return function(scope) {
          scope.xitiConf = {
            //Springboard constants
            ID_COLLECTIVITE: "",
            ID_PLATEFORME: "",
            ID_PROJET: "",

            //Structure var
            ID_ETAB: "",

            //App vars
            ID_SERVICE: "",
            LIB_SERVICE: "Page_ENT",

            //User vars
            ID_PERSO: "",
            ID_PROFIL: 6
          };

          //Profile id map
          scope.profileMap = {
            Student: 1,
            Teacher: 2,
            Relative: 3,
            Personnel: 4
          };

          //Service map
          scope.serviceMap = xitiIndex;

          /////////////
          /// Tools ///
          var getOrElse = function(map, item, elseItem) {
            if (map && item && map[item]) return map[item];
            return elseItem;
          };

          var convertStringId = function(stringId) {
            var buffer = "";
            for (var i = 0; i < stringId.length; i++) {
              buffer += stringId.charCodeAt(i);
            }
            return buffer;
          };

          ///        ///
          //////////////

          var loadScript = function(callback) {
            if (scope.script) {
              callback(scope.script);
            } else {
              var request = new XMLHttpRequest();
              request.open("GET", "./xiti/xtfirst_ENT.js");
              request.onload = function() {
                if (request.status === 200) {
                  try {
                    scope.script = new Function(request.responseText);
                    callback(scope.script);
                  } catch (e) {
                    console.log(e);
                  }
                }
              };
              request.send(null);
            }
          };

          //Final action - populates xiti vars & launches the script
          var fillWindowData = function() {
            xt_multc =
              "&x1=" +
              scope.xitiConf.ID_SERVICE +
              "&x2=" +
              scope.xitiConf.ID_PROFIL +
              "&x3=" +
              scope.xitiConf.ID_PROJET +
              "&x4=" +
              scope.xitiConf.ID_PLATEFORME;

            xtcode = "";
            xt_at = scope.xitiConf.ID_PERSO;
            xtidc = scope.xitiConf.ID_PERSO;
            xt_ac = scope.xitiConf.ID_PROFIL;

            window.xtparam = xt_multc + "&ac=" + xt_ac + "&at=" + xt_at;

            xtnv = document;
            xtsd = "https://logs";
            xtsite = scope.xitiConf.ID_COLLECTIVITE;
            xtn2 = scope.xitiConf.ID_ETAB;
            xtpage = scope.xitiConf.LIB_SERVICE;
            xtdi = "";

            loadScript(script => script());
          };

          //Retrieves application dependent vars
          var getAppsInfos = function(state) {
            var service = scope.serviceMap[state];

            scope.xitiConf.ID_SERVICE = service ? service.index : 0;
            scope.xitiConf.LIB_SERVICE = service ? service.label : "Page_ENT";

            return Promise.resolve();
          };

          //Retrieves structure mapping & platform dependant vars
          var getXitiConfig = function() {
            return new Promise((resolve, reject) => {
              RequestService.get(`${domainENT}/xiti/config`).then(
                ({ data }) => {
                  //If XiTi is disabled
                  if (!data.active) {
                    reject();
                  }

                  scope.xitiConf.ID_PLATEFORME = data.ID_PLATEFORME;
                  scope.xitiConf.ID_PROJET = data.ID_PROJET;

                  scope.xitiConf.ID_ETAB =
                    scope.user.schools.length > 0
                      ? data.structureMap[scope.user.schools[0].id].id
                      : 0;
                  scope.xitiConf.ID_COLLECTIVITE =
                    scope.user.schools.length > 0
                      ? data.structureMap[scope.user.schools[0].id]
                          .collectiviteId
                      : 0;
                  resolve();
                },
                reject
              );
            });
          };

          var getUserInfo = function() {
            return UserFactory.getUser().then(me => {
              scope.user = me;
              scope.xitiConf.ID_PERSO = convertStringId(scope.user.userId);
              scope.xitiConf.ID_PROFIL = getOrElse(
                scope.profileMap,
                scope.user.type,
                6
              );
            });
          };

          $rootScope.$on("LoggedIn", () => {
            getUserInfo().then(() => {
              Promise.all([getXitiConfig(), getAppsInfos("login")]).then(() => {
                fillWindowData();
              }, console.log);
            }, console.log);
          });

          $rootScope.$on("$stateChangeSuccess", function(evt, toState) {
            if (toState.xitiIndex) {
              getUserInfo().then(() => {
                Promise.all([
                  getXitiConfig(),
                  getAppsInfos(toState.xitiIndex)
                ]).then(() => {
                  fillWindowData();
                }, console.log);
              }, console.log);
            }
          });

          scope.$on("$destroy", function() {
            element.off();
          });
        };
      }
    };
  });

function setProfileImage(regularPath, userId) {
  return regularPath != null &&
    regularPath.length > 0 &&
    regularPath != "no-avatar.jpg"
    ? regularPath
    : "/userbook/avatar/" + userId;
}

function fail() {
  console.log("failed to get filesystem");
}

function gotFS(fileSystem) {
  window.FS = fileSystem;

  var printDirPath = function(entry) {
    console.log("Dir path - " + entry.fullPath);
  };

  createDirectory("ENT/conversation", printDirPath);
  createDirectory("ENT/workspace", printDirPath);
}

function createDirectory(path, success) {
  var dirs = path.split("/").reverse();
  var root = window.FS.root;

  var createDir = function(dir) {
    root.getDirectory(
      dir,
      {
        create: true,
        exclusive: false
      },
      successCB,
      failCB
    );
  };

  var successCB = function(entry) {
    console.log("dir created " + entry.fullPath);
    root = entry;
    if (dirs.length > 0) {
      createDir(dirs.pop());
    } else {
      console.log("all dir created");
      success(entry);
    }
  };

  var failCB = function() {
    console.log("failed to create dir " + dir);
  };

  createDir(dirs.pop());
}
