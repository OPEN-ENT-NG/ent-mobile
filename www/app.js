angular
  .module("ent", [
    "ionic",
    "ngCordova",
    "ngCookies",
    "ngSanitize",
    "ngRoute",
    "ent.actualites",
    "ent.blog",
    "ent.blog-list",
    "ent.oauth2",
    "ent.messagerie",
    "ent.workspace",
    "ent.user",
    "ent.pronotes",
    "ent.support",
    "angularMoment",
    "ng-mfb",
    "ui.router",
    "ent.timeline",
    "angular.img",
    "ent.request",
    "ent.firstConnection",
    "ent.firstConnectionService",
    "ent.forgotLoginPwd",
    "ent.forgotLoginPwdService",
    "ent.authLoader",
    "ent.profile"
  ])

  .run(function(
    $ionicPlatform,
    $rootScope,
    $cordovaGlobalization,
    amMoment,
    RequestService
  ) {
    $ionicPlatform.ready(function() {
      RequestService.setDefaultHeaders();
      //window.FirebasePlugin.setBadgeNumber(0);
      cordova.plugins.notification.badge.clear();

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

      if (!ionic.Platform.isIOS()) {
        cordova.plugins.diagnostic.requestRuntimePermissions(
          function(status) {
            console.log(status);
            switch (status) {
              case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
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
        console.log("IOS : Granted permission");
        window.FirebasePlugin.grantPermission(function() {
          console.log("IOS: Permission granted");
          window.FirebasePlugin.hasPermission(function(data) {
            console.log("IOS: has firebase permission ? " + data.isEnabled);
          });
        });
      }

      $cordovaGlobalization.getPreferredLanguage().then(
        function(result) {
          localStorage.setItem("preferredLanguage", result.value);
          amMoment.changeLocale(result.value);
        },
        function(error) {
          console.log(error);
        }
      );

      window.requestFileSystem =
        window.requestFileSystem || window.webkitRequestFileSystem;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

      $rootScope.$on("$cordovaNetwork:offline", function() {
        console.log("offline");
        $rootScope.status = "offline";
      });

      $rootScope.$on("$cordovaNetwork:online", function() {
        console.log("online");
        $rootScope.status = $rootScope.status == undefined ? null : "online";
      });
    });
  })

  .config(function(
    $stateProvider,
    $urlRouterProvider,
    $ionicConfigProvider,
    $httpProvider
  ) {
    $httpProvider.defaults.withCredentials = true;

    if (!ionic.Platform.isIOS()) {
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }

    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.backButton.text("").previousTitleText(false);

    $stateProvider
      .state("app", {
        url: "/app",
        abstract: true,
        templateUrl: "menu.html",
        controller: "AppCtrl"
      })

      .state("app.messagerie", {
        url: "/messagerie",
        cache: false,
        templateUrl: "messagerie/folder_view.html",
        controller: "MessagerieFoldersCtrl"
      })

      .state("app.message_folder", {
        url: "/messagerie/:nameFolder/:idFolder",
        cache: false,
        templateUrl: "messagerie/folder_content.html",
        controller: "InboxCtrl"
      })

      .state("app.message_detail", {
        url: "/messagerie/:nameFolder/:idMessage",
        templateUrl: "messagerie/detail.html",
        controller: "MessagesDetailCtrl"
      })

      .state("app.new_message", {
        url: "/new_message",
        cache: false,
        templateUrl: "messagerie/new_message.html",
        controller: "NewMessageCtrl"
      })

      .state("app.blog-list", {
        url: "/blog-list",
        templateUrl: "blogs/blog-list.html",
        controller: "BlogListCtrl"
      })

      .state("app.blog", {
        url: "/blog/:nameBlog/:idBlog",
        templateUrl: "blogs/blog.html",
        controller: "BlogCtrl"
      })

      .state("app.timeline_list", {
        url: "/timeline",
        templateUrl: "timeline/timeline.html",
        controller: "TimelineCtrl"
      })

      .state("app.timeline_prefs", {
        url: "/preferences",
        templateUrl: "timeline/timeline_filter.html",
        controller: "TimelineCtrl"
      })

      .state("app.actualites", {
        url: "/actualites",
        templateUrl: "actualites/actualites.html",
        controller: "ActualitesCtrl"
      })

      .state("app.threads", {
        url: "/threads",
        templateUrl: "actualites/threads.html",
        controller: "ActualitesCtrl"
      })

      .state("app.listPronotes", {
        url: "/listPronotes",
        templateUrl: "pronotes/listPronotes.html",
        controller: "PronoteCtrl"
      })

      .state("app.pronote", {
        url: "/pronote",
        templateUrl: "pronotes/pronote.html",
        controller: "PronoteCtrl"
      })

      .state("app.workspace", {
        url: "/workspace",
        templateUrl: "workspace/workspace.html"
      })

      .state("app.workspace_tree", {
        url: "/workspace/tree",
        params: {
          filter: null,
          folderId: null,
          folderName: null
        },
        controller: "WorkspaceFolderContentCtlr",
        templateUrl: "workspace/tree.html"
      })

      .state("app.workspace_file", {
        url: "/workspace/file",
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
        url: "/workspace/move_copy",
        params: {
          action: null,
          items: null
        },
        templateUrl: "workspace/move_copy.html",
        controller: "MoveCopyCtrl"
      })

      .state("app.workspace_share", {
        url: "/workspace/share",
        params: {
          filter: null,
          ids: null
        },
        controller: "ShareItemController",
        templateUrl: "workspace/share.html"
      })

      .state("app.profile", {
        url: "/profile",
        controller: "ProfileCtrl",
        templateUrl: "profile/profile.html"
      })

      .state("app.support", {
        url: "/support",
        controller: "SupportCtrl",
        templateUrl: "support/support.html"
      })

      .state("login", {
        params: {
          prefill: false
        },
        url: "/login",
        templateUrl: "authentification/login-credentials.html",
        controller: "LoginCtrl",
        cache: false
      })

      .state("firstConnection", {
        url: "/firstConnection",
        templateUrl: "firstConnection/firstConnection.html",
        controller: "FirstConnectionCtrl"
      })

      .state("forgotLoginPwd", {
        url: "/forgotLoginPwd",
        templateUrl: "forgotLoginPwd/forgotLoginPwd.html",
        controller: "ForgotLoginPwdCtrl"
      })

      .state("authLoading", {
        url: "/auth-loading",
        templateUrl: "authLoader/authLoader.html",
        controller: "AuthLoaderCtrl"
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise("/auth-loading");
    // $urlRouterProvider.otherwise('/app/workspace/documents');
  })

  .controller("AppCtrl", function(
    PronoteService,
    $scope,
    $rootScope,
    $sce,
    $state,
    $ionicPlatform,
    $ionicSideMenuDelegate,
    $cordovaFile,
    $cordovaFileOpener2,
    domainENT,
    $ionicHistory,
    SkinFactory,
    $ionicPopup,
    ActualitesService,
    MessagerieServices,
    PronoteService,
    BlogsService,
    WorkspaceService,
    TimelineService,
    $filter,
    $http,
    $ionicLoading,
    $q,
    $timeout,
    OAuthService,
    $location
  ) {
    $scope.showGridMenu = false;

    $rootScope.locationPath = $state.current.url;

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

    $ionicPlatform.ready(function() {
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
          name: "Accéder à l'ENT",
          icon: "ent-link",
          state: domainENT
        },
        {
          name: "Assistance ENT",
          icon: "custom-help-circled help-circledicon-",
          state: "app.support"
        }
      ];

      PronoteService.getAllAccounts().then(function(resp) {
        if (resp.length > 0) {
          $rootScope.listMenu.unshift({
            name: "Pronote",
            icon: "custom-pronote pronote-1icon-",
            state: "app.listPronotes"
            // href: "#/app/listPronotes"
          });
        }
      });

      //SkinFactory.getSkin().then(function(res) {
      localStorage.setItem("skin", "/assets/themes/paris/skins/default/");
      //localStorage.setItem('skin', res.data.skin);
      //} , function(err){
      //  $scope.showAlertError(err);
      //});

      var intentHandler = function(intent) {
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
                      file.size >
                        $rootScope.translationWorkspace["max.file.size"]
                    ) {
                      getPopupFactory.getAlertPopupNoTitle(
                        $rootScope.translationWorkspace[
                          "file.too.large.limit"
                        ] +
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
                            $scope.showAlertError(err);
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
      };

      $q.all([
        getTranslationActualites(),
        getTranslationConversation(),
        getTraductionBlogs(),
        getTraductionWorkspace()
      ]).then(function() {
        window.plugins.intent.setNewIntentHandler(intentHandler);
      });

      function manageNotification(data) {
        //window.FirebasePlugin.getBadgeNumber(function(n) {
        //  window.FirebasePlugin.setBadgeNumber(n - 1);
        //});
        //cordova.plugins.notification.badge.decrease(1, function (badge) {
        // badge is now 9 (11 - 2)
        //});
        if (data.params) {
          var params = JSON.parse(data.params);
          var module = /\/([\w]+)\W?/g.exec(params.resourceUri)[1];

          $rootScope.notification = {};
          switch (module) {
            case "blog": {
              $rootScope.notification.state = "app.blog";
              $rootScope.notification.id = params.postUri.split("/").pop();
              $state.go("app.blog", {
                nameBlog: params.blogTitle,
                idBlog: params.blogUri.split("/").pop()
              });
              break;
            }
            case "workspace": {
              $state.go("app.workspace_tree", {
                filer: "shared"
              });
              break;
            }
            case "conversation": {
              $rootScope.notification.state = "app.message_detail";
              $rootScope.notification.id = params.messageUri.split("/").pop();
              $rootScope.nameFolder = "inbox";
              $state.go("app.message_detail", {
                nameFolder: "INBOX",
                idMessage: $rootScope.notification.id
              });
              break;
            }
            case "actualites": {
              $rootScope.notification.state = "app.actualites";
              $rootScope.notification.id = params.resourceUri.split("/").pop();
              $state.go("app.actualites");
              break;
            }
            default: {
              window.open(
                domainENT +
                  "/auth/login?callBack=" +
                  encodeURIComponent(domainENT + params.resourceUri),
                "_system"
              );
            }
          }
        }
      }

      window.FirebasePlugin.onNotificationOpen(function(data) {
        cordova.plugins.notification.badge.increase(1, function(badge) {
          // badge is now 11 (10 + 1)
        });
        if (data.tap) {
          manageNotification(data);
        } else {
          // window.FirebasePlugin.getBadgeNumber(function(n) {
          //   window.FirebasePlugin.setBadgeNumber(n + 1);
          // });

          data.text = data.body;
          data.foreground = true;
          cordova.plugins.notification.local.schedule(data);
          cordova.plugins.notification.local.on("click", function(
            notification
          ) {
            manageNotification(notification);
          });
        }
      });

      $scope.displayBar = function() {
        let regexp = RegExp("^app.*$");
        return regexp.test($state.current.name);
      };

      $scope.isHomeActive = function() {
        return (
          $state.current.name == "app.timeline_list" ||
          $state.current.name == "app.timeline_prefs"
        );
      };

      $scope.isMessagerieActive = function() {
        return (
          $state.current.name == "app.messagerie" ||
          $state.current.name == "app.message_folder" ||
          $state.current.name == "app.message_detail" ||
          $state.current.name == "app.new_message"
        );
      };

      $scope.isGridActive = function() {
        return (
          $state.current.name == "app.blog-list" ||
          $state.current.name == "app.blog" ||
          $state.current.name == "app.actualites" ||
          $state.current.name == "app.threads" ||
          $state.current.name == "app.listPronotes" ||
          $state.current.name == "app.pronote" ||
          $state.current.name == "app.workspace" ||
          $state.current.name == "app.workspace_tree" ||
          $state.current.name == "app.workspace_file" ||
          $state.current.name == "app.workspace_movecopy" ||
          $state.current.name == "app.workspace_share" ||
          $state.current.name == "app.support"
        );
      };

      $scope.isProfileActive = function() {
        return $state.current.name == "app.profile";
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

      // $scope.actuButton = function() {
      //   $scope.gridButton();
      // };

      // $scope.blogButton = function() {
      //   $state.go("app.blog");
      //   $scope.gridButton();
      // };

      // $scope.docuButton = function() {
      //   // $state.go("app.workspace");
      //   $scope.gridButton();
      // };

      // $scope.pronoteButton = function() {
      //   $state.go("app.pronote");
      //   $rootScope.showGridMenu = !$rootScope.showGridMenu;
      // };

      $scope.clickTimelineNotif = function(type, resource, params) {
        console.log(type);
        switch (type) {
          case "MESSAGERIE":
            $state.go("app.message_detail", {
              nameFolder: "INBOX",
              idMessage: resource
            });
            break;
          case "NEWS":
            $rootScope.notification = params;
            $rootScope.notification.state = "app.actualites";
            $rootScope.notification.id = params.resourceUri.split("/").pop();
            $state.go("app.actualites");
            break;
          case "BLOG":
            $rootScope.notificationParam = params;
            $state.go("app.blog", {
              nameBlog: params.blogTitle,
              idBlog: params.blogUri.split("/").pop()
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
                encodeURIComponent(
                  domainENT + (params.resourceUri || params.uri)
                ),
              "_system"
            );
        }
      };

      $scope.$watch(
        function() {
          return $ionicSideMenuDelegate.getOpenRatio();
        },
        function(ratio) {
          if (ratio == 1) {
            MessagerieServices.getCountUnread(["INBOX"]).then(
              function(response) {
                $scope.badgeMessagerie = response[0].count;
              },
              function(err) {
                $scope.showAlertError(err);
              }
            );
          } else if (ratio == 0) {
            $scope.closeApp = false;
          }
        }
      );

      $ionicPlatform.registerBackButtonAction(function(e) {
        if ($scope.closeApp) {
          //navigator.app.exitApp();
        } else if ($ionicSideMenuDelegate.isOpenLeft()) {
          $ionicSideMenuDelegate.toggleLeft();
        } else if (
          $ionicHistory.backView() &&
          $ionicHistory.currentView().backViewId != "ion1"
        ) {
          $ionicHistory.goBack();
        } else if (!$ionicSideMenuDelegate.isOpenLeft()) {
          $ionicSideMenuDelegate.toggleLeft();
          $scope.closeApp = true;
        }
      }, 1000);
    });

    $rootScope.downloadFile = function(fileName, urlFile) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });

      var filePath = ionic.Platform.isIOS()
        ? cordova.file.dataDirectory
        : cordova.file.externalRootDirectory + "Download/";

      var failure = function(err) {
        $scope.showAlertError(err);
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

      checkFile();
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
          $scope.showAlertError(error);
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

    var getDateAsMoment = function(date) {
      var momentDate;
      if (moment.isMoment(date)) {
        momentDate = date;
      } else if (date.$date) {
        momentDate = moment(date.$date);
      } else if (typeof date === "number") {
        momentDate = moment.unix(date);
      } else {
        momentDate = moment(date);
      }
      return momentDate;
    };

    $scope.formatDate = function(date) {
      var momentDate = getDateAsMoment(date);
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
      OAuthService.deleteFcmToken();
      localStorage.clear();
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
      //navigator.splashscreen.show();
      window.FirebasePlugin.unregister();
      $state.go("login");
      window.cookies.clear(function() {
        console.log("Cookies cleared!");
      });

      // var success = function(status) {
      //   console.log('Message: ' + status);
      // }
      //
      // var error = function(status) {
      //   console.log('Error: ' + status);
      // }
      //
      // window.cache.clear( success, error );
      // window.cache.cleartemp(); //
      // ionic.Platform.exitApp(); // stops the app
      location.reload();
    };

    function getTranslationActualites() {
      return ActualitesService.getTranslation().then(
        function(resp) {
          $rootScope.translationActus = resp.data;
        },
        function(err) {
          $scope.showAlertError(err);
        }
      );
    }

    function getTranslationConversation() {
      return (
        MessagerieServices.getTranslation().then(function(resp) {
          $rootScope.translationConversation = resp.data;
        }),
        function(err) {
          $scope.showAlertError(err);
        }
      );
    }

    function getTraductionBlogs() {
      return (
        BlogsService.getTraduction().then(function(resp) {
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
        }),
        function(err) {
          $scope.showAlertError(err);
        }
      );
    }

    function getTraductionWorkspace() {
      return (
        WorkspaceService.getTranslation().then(function(resp) {
          $rootScope.translationWorkspace = resp.data;
        }),
        function(err) {
          $scope.showAlertError(err);
        }
      );
    }

    $scope.openPopover = function($event) {
      $rootScope.popover.show($event);
    };

    $scope.closePopover = function() {
      $rootScope.popover.hide();
    };

    //Cleanup the popover when we're done with it!
    $scope.$on("$destroy", function() {
      $rootScope.popover.remove();
    });
    // An alert dialog
    $scope.showAlertError = function(error) {
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

        var alertPopup = $ionicPopup.alert({
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
            $ionicHistory.goBack();
          }
        });
      }
    };
  })

  .factory("getPopupFactory", function($ionicPopup) {
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
        template: template,
        okText: "OK"
      });
    };

    this.getAlertPopupNoTitle = function(template) {
      return $ionicPopup.alert({
        template: template,
        cssClass: "dismiss-title", // Hide title
        okText: "OK"
      });
    };

    // this.killPopop = function() {
    //   return $ionicPopup.
    // }

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
  });

function setProfileImage(regularPath, userId) {
  return regularPath != null &&
    regularPath.length > 0 &&
    regularPath != "no-avatar.jpg"
    ? regularPath
    : "/userbook/avatar/" + userId;
}

function findElementById(arraytosearch, valuetosearch) {
  for (var i = 0; i < arraytosearch.length; i++) {
    if (arraytosearch[i].id == valuetosearch) {
      return arraytosearch[i];
    }
  }
  return null;
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
