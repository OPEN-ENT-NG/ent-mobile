angular.module('ent', ['ionic', 'ngCordova', 'ngCookies','ngSanitize', 'ngRoute','ent.actualites','ent.blog',
'ent.blog-list','ent.oauth2', 'ent.messagerie','ent.workspace','ent.user','ent.pronotes', 'angularMoment',
  'ent.test', 'ng-mfb', 'ui.router', 'angular.img', 'ent.request'])


.run(function($ionicPlatform, $ionicLoading, $rootScope,$cordovaGlobalization, $cordovaInAppBrowser, amMoment) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleLightContent();
      StatusBar.overlaysWebView(false);
    }

    cordova.getAppVersion.getVersionNumber(function (version) {
      $rootScope.version = version;
    });

    cordova.getAppVersion.getAppName(function (name) {
      $rootScope.appName = name;
    });

    if (!ionic.Platform.isIOS()){
      cordova.plugins.diagnostic.requestRuntimePermissions(function(status){
        console.log(status);
        switch(status){
          case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
            console.log("Permission not requested");
            break;
          case cordova.plugins.diagnostic.permissionStatus.DENIED:
            console.log("Permission denied");
            break;
          case cordova.plugins.diagnostic.permissionStatus.GRANTED:
            console.log("Permission granted always");
            break;
          case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
            console.log("Permission granted only when in use");
            break;
        }
      }, function(error){
        console.error(error);
      }, cordova.plugins.diagnostic.runtimePermissionGroups.STORAGE);
    }

    $cordovaGlobalization.getPreferredLanguage().then(function(result) {
      localStorage.setItem('preferredLanguage', result.value);
      amMoment.changeLocale(result.value);
    }, function(error) {
      console.log(error);
    })

    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
  });

})

.config(function($stateProvider, $urlRouterProvider, $routeProvider, $ionicConfigProvider,  $httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        if (localStorage.getItem('access_token')) {
          // config.headers['Authorization'] = 'Bearer '+localStorage.getItem('access_token')
          // console.log("localStorage.getItem('access_token') "+localStorage.getItem('access_token'));
        }
        // console.log("loading:show");
        // $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        // console.log("loading:hide");

        //    alert('besoin de refreshToken');
        // $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  })

  if (!ionic.Platform.isIOS()) {
    $ionicConfigProvider.scrolling.jsScrolling(false)
  }

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'menu.html',
    controller: 'AppCtrl'
  })

  .state('app.messagerie', {
    url: '/messagerie',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'messagerie/folder_view.html',
      }
    }
  })

  .state('app.message_folder', {
    url: '/messagerie/:nameFolder/:idFolder',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'messagerie/folder_content.html'
      }
    }
  })

  .state('app.message_detail', {
    url: '/messagerie/:nameFolder/:idMessage',
    views: {
      'menuContent': {
        templateUrl: 'messagerie/detail.html',
        controller: 'MessagesDetailCtrl'
      }
    }
  })
  .state('app.new_message', {
    url: '/new_message',
    views: {
      'menuContent': {
        templateUrl: 'messagerie/new_message.html',
        controller: 'NewMessageCtrl'
      }
    }
  })

  .state('app.blog-list', {
    url: '/blog-list',
    views: {
      'menuContent': {
        templateUrl: 'blogs/blog-list.html',
        controller: 'BlogListCtrl'
      }
    }
  })

  .state('app.blog', {
    url: '/blog/:nameBlog/:idBlog',
    views: {
      'menuContent': {
        templateUrl: 'blogs/blog.html',
        controller: "BlogCtrl"
      }
    }
  })

  .state('app.actualites', {
    url: '/actualites',
    views: {
      'menuContent': {
        templateUrl: 'actualites/actualites.html',
        controller: 'ActualitesCtrl'
      }
    }
  })

  .state('app.threads', {
    url: '/threads',
    views: {
      'menuContent': {
        templateUrl: 'actualites/threads.html'
      }
    }
  })

  .state('app.listPronotes', {
    url: '/listPronotes',
    views: {
      'menuContent': {
        templateUrl: 'pronotes/listPronotes.html'
      }
    }
  })

  .state('app.pronote', {
    url: '/pronote' ,
    views: {
      'menuContent': {
        templateUrl: 'pronotes/pronote.html'
      }
    }
  })

  .state('app.workspace', {
    url: '/workspace',
    views: {
      'menuContent': {
        templateUrl: 'workspace/main_workspace.html'
      }
    }
  })

  .state('app.workpace_folder_content', {
    url: '/workspace/:nameWorkspaceFolder',
    views: {
      'menuContent': {
        controller: 'WorkspaceFolderContentCtlr',
        templateUrl: 'workspace/workspace_folder_content.html'
        // resolve: {
        //   foldersData : function(WorkspaceFoldersFactory){
        //     var FolderData = WorkspaceFoldersFactory.getFolders(nameWorkspaceFolder)
        //     return FolderData.$promise
        //   }
        // }
      }
    }
  })

  .state('app.workpace_trash', {
    url: '/trashWorkspace',
    views: {
      'menuContent': {
        controller: 'WorkspaceTrashContentCtlr',
        templateUrl: 'workspace/workspace_folder_content.html'
      }
    }
  })

  .state('app.workspace_folder_depth', {
    url: '/workspace/:filtre/:parentFolderName/:nameFolder',
    views: {
      'menuContent': {
        controller: 'WorkspaceFolderDepthCtlr',
        templateUrl: 'workspace/workspace_folder_content.html'
      }
    }
  })

  .state('app.workspace_file', {
    url: '/workspace/file/:filtre',
    views: {
      'menuContent': {
        controller: 'WorkspaceFileCtlr',
        templateUrl: 'workspace/file.html'
      }
    }
  })

  .state('app.workspace_file_versions', {
    url: '/workspace/file/versions/',
    views: {
      'menuContent': {
        controller: 'FileVersionCtrl',
        templateUrl: 'workspace/file_versions.html'
      }
    }
  })

  .state('app.workspace_tree', {
    url: '/workspace/tree/:action',
    views: {
      'menuContent': {
        templateUrl: 'workspace/tree-list-folders.html'
      }
    }
  })

  .state('app.workspace_share', {
    url: '/workspace/share/:idItems/:idOwner',
    views: {
      'menuContent': {
        templateUrl: 'workspace/share_items.html'
      }
    }
  })


  .state('app.test', {
    url: '/test',
    views: {
      'menuContent': {
        templateUrl: 'test/input_file.html',
        controller: 'FoldersCtrl'
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'authentification/login-credentials.html',
    controller: 'LoginCtrl',
    cache: false
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login')
  // $urlRouterProvider.otherwise('/app/workspace/documents');
})

.controller('AppCtrl', function ($scope, $rootScope, $sce, $state, $ionicPlatform, $ionicSideMenuDelegate, $cordovaFileTransfer, $cordovaFileOpener2, domainENT, $ionicHistory, SkinFactory, $ionicPopup, ActualitesService, MessagerieServices,PronoteService, BlogsService, WorkspaceService, $filter, $http){

  $rootScope.filterThreads = [];

  $rootScope.listMenu =  [{'name':'Actualites','icon':'custom-newspaper newspapericon-', 'href':'#/app/actualites'},
                          {'name':'Messagerie','icon':'custom-mail mailicon-', 'href':'#/app/messagerie/inbox/INBOX'},
                          {'name':'Blog','icon':'custom-bullhorn bullhornicon-', 'href':'#/app/blog-list'},
                          {'name':'Documents','icon':'custom-folder foldericon-', 'href':'#/app/workspace'},
                          {'name':'Pronote','icon':'custom-pronote pronote-1icon-', 'href':'#/app/listPronotes'}];

  //SkinFactory.getSkin().then(function(res) {
    localStorage.setItem('skin', '/assets/themes/paris/skins/default/');
    //localStorage.setItem('skin', res.data.skin);
  //} , function(err){
  //  $scope.showAlertError(err);
  //});

  getTranslationActualites();
  getTranslationConversation();
  getTraductionBlogs();
  getTraductionWorkspace();

  $scope.$watch(function () {
    return $ionicSideMenuDelegate.getOpenRatio();
  }, function (ratio) {
    if (ratio == 1){
      MessagerieServices.getCountUnread(["INBOX"]).then(function (response){
        $scope.badgeMessagerie = response[0].count
      } , function(err){
        $scope.showAlertError(err)
      });
    } else if(ratio==0){
      $scope.closeApp = false ;
    }
  });

  $ionicPlatform.registerBackButtonAction( function (e){
    if($scope.closeApp){
      //navigator.app.exitApp();
    }else if($ionicSideMenuDelegate.isOpenLeft()){
      $ionicSideMenuDelegate.toggleLeft();
    }else if($ionicHistory.backView() && $ionicHistory.currentView().backViewId!='ion1'){
      $ionicHistory.goBack();
    }else if(!$ionicSideMenuDelegate.isOpenLeft()) {
      $ionicSideMenuDelegate.toggleLeft();
      $scope.closeApp = true ;
    }
  }, 1000);

  $scope.downloadFile = function (fileName, urlFile){

    // Save location
    // var url = $sce.trustAsResourceUrl(urlFile)
    // var targetPath = cordova.file.externalRootDirectory + 'Download/' + filename;
    //$cordovaProgress.showSimpleWithLabelDetail(true, 'Téléchargement en cours (Bouton retour pour quitter)', filename)
    SpinnerDialog.show(null, 'Téléchargement en cours (Bouton retour pour quitter)', true);

    var config =
      {
        method: 'GET',
        url: $sce.trustAsResourceUrl(urlFile),
        responseType: 'arraybuffer',
        cache: true
      };

    $http(config).then(function(result) {
      var MIMEType = result.headers('content-type').split(';')[0];
      var filePath = ionic.Platform.isIOS() ?
        cordova.file.dataDirectory : cordova.file.externalRootDirectory + 'Download/';

      window.resolveLocalFileSystemURL(filePath, function (fs) {
        fs.getFile(fileName, {create: true, exclusive: false}, function(file) {
          file.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function (f) {
              $scope.openLocalFile(file.nativeURL, MIMEType);
              SpinnerDialog.hide();
            };

            fileWriter.onerror = function (err) {
              $scope.showAlertError(err);
              SpinnerDialog.hide();
            };

            if (result) {
              fileWriter.write(new Blob([result.data], {type: MIMEType}));
            }
          });
        }, function (err) {
          $scope.showAlertError(err);
          SpinnerDialog.hide();
        });
      }, function (err) {
        $scope.showAlertError(err);
        SpinnerDialog.hide();
      });
    }, function (err) {
      $scope.showAlertError(err);
      SpinnerDialog.hide();
    });
  }

  $scope.openUrl = function (url) {
    var target = '_system';
    var ref = cordova.InAppBrowser.open($sce.trustAsUrl(url), target);

    ref.addEventListener('loadstart', loadstartCallback);
    ref.addEventListener('loadstop', loadstopCallback);
    ref.addEventListener('loaderror', loaderrorCallback);
    ref.addEventListener('exit', exitCallback);

    function loadstartCallback(event) {
      console.log('Loading started: ' + event.url)
    }

    function loadstopCallback(event) {
      console.log('Loading finished: ' + event.url)
    }

    function loaderrorCallback(error) {
      console.log('Loading error: ' + error.message)
    }

    function exitCallback() {
      console.log('Browser is closed...')
    }
  }

  $scope.openLocalFile = function (targetPath, fileMIMEType){
    $cordovaFileOpener2.open(
      targetPath,
      fileMIMEType,
      {
        error : function () {
          $scope.showAlertError(error)
        },
        success : function (){
          console.log('File displayed');
        }
      }
    )
  }

  $scope.getImageUrl = function (path) {
    if (path) {
      return domainENT + (path.startsWith('/') ? path : '/' + path);
    }
  }

  $scope.getThumbnailUrl = function (path) {
    if (path) {
      return path
    }
  }

  $scope.setCorrectImage = function (path, defaultImage) {
    var result
    if (path != null && path.length > 0) {
      result = path
    } else {
      if (!localStorage.getItem('skin') || localStorage.getItem('skin') == 'undefined' ) {
       // SkinFactory.getSkin().then(function(res) {
          localStorage.setItem('skin', '/assets/themes/paris/skins/default/');
//          localStorage.setItem('skin', res.data.skin)
          console.log(localStorage.getItem('skin'))
          result = localStorage.getItem('skin')+defaultImage
       // });
      } else {
        result = localStorage.getItem('skin')+defaultImage
      }
    }
    return result
  }

  var getDateAsMoment = function (date) {
    var momentDate
    if (moment.isMoment(date)) {
      momentDate = date;
    } else if (date.$date) {
      momentDate = moment(date.$date);
    } else if (typeof date === "number"){
      momentDate = moment.unix(date);
    } else {
      momentDate = moment(date);
    }
    return momentDate;
  };

  $scope.formatDate = function(date){
    var momentDate = getDateAsMoment(date);
    return moment(momentDate).calendar();
  };

  $scope.formatDateLocale = function(date){
    if(moment(date) > moment().add(-1, 'days').startOf('day') && moment(date) < moment().endOf('day'))
    return moment(date).calendar();

    if(moment(date) > moment().add(-7, 'days').startOf('day') && moment(date) < moment().endOf('day'))
    return moment(date).fromNow(); //this week

    return moment(date).format("L");
  };

  $scope.getSizeFile = function (size){
    return $filter('bytes')(size);
  }



  $scope.logout = function(){
    localStorage. clear();
    $ionicHistory.clearHistory()
    $ionicHistory.clearCache();
    //navigator.splashscreen.show();
    $state.go("login");
    window.cookies.clear(function() {
      console.log('Cookies cleared!');
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
  }

  function getTranslationActualites(){
    ActualitesService.getTranslation().then(function(resp){
      $rootScope.translationActus = resp.data
    }, function(err){
      $scope.showAlertError(err)
    });
  }

  function getTranslationConversation() {
    MessagerieServices.getTranslation().then(function(resp) {
      $rootScope.translationConversation = resp.data
    }), function(err) {
      $scope.showAlertError(err)
    };
  }

  function getTraductionBlogs(){
    BlogsService.getTraduction().then(function(resp){
      $rootScope.translationBlog = resp.data;
      $rootScope.translationBlog['filters.drafts'] = $rootScope.translationBlog['filters.drafts'].substring(0,$rootScope.translationBlog['filters.drafts'].indexOf('(')-1);
      $rootScope.translationBlog['filters.submitted'] = $rootScope.translationBlog['filters.submitted'].substring(0,$rootScope.translationBlog['filters.submitted'].indexOf('(')-1);
    }), function(err){
      $scope.showAlertError(err)
    }
  }

  function getTraductionWorkspace(){
    WorkspaceService.getTranslation().then(function(resp) {
      $rootScope.translationWorkspace = resp.data;
    }), function (err){
      $scope.showAlertError(err)
    }
  }

  $scope.getConfirmPopup = function(title, template, cancelText, okText) {
    return $ionicPopup.confirm({
      title: title,
      template: template,
      cancelText: cancelText,
      okText: okText
    })
  }

  $scope.getAlertPopup = function(title, template) {
    return $ionicPopup.alert({
      title: title,
      template: template,
      okText: 'OK'
    })
  }

  $scope.getAlertPopupNoTitle = function(template) {
    return $ionicPopup.alert({
      template: template,
      cssClass: 'dismiss-title', // Hide title
      okText: 'OK'
    })
  }

  $scope.openPopover = function($event) {
    $rootScope.popover.show($event);
  };

  $scope.closePopover = function() {
    $rootScope.popover.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $rootScope.popover.remove();
  })
  // An alert dialog
  $scope.showAlertError = function (error) {
    console.log(error)
    var isPermissions = false ;
    var title = 'Erreur de connexion'
    var template = 'Nous recontrons actuellement des problèmes. Veuillez réessayer dans quelques instants.'
    if (error) {
      if (error.hasOwnProperty('status')) {
        switch (error.status) {
          case 401:
            title = 'Oups !'
            template = "Vous n'avez pas le droit d'accéder à ce contenu."
            break
            default:
        }
      }
      if(error.hasOwnProperty('http_status')){
          switch (error.http_status) {
            case 200:
              isPermissions = true ;
              title = 'Oups !'
              template = "Vous n'avez pas validé les permission de stockage"
              break;
            default:
          }
      }

      var alertPopup = $ionicPopup.alert({
        title: title,
        template: template
      })

      alertPopup.then(function(res) {
        console.log(res);
        console.log(isPermissions);
        if(isPermissions){
          console.log(cordova.plugins.diagnostic);
          cordova.plugins.diagnostic.requestRuntimePermissions(function(status){
            console.log(status);
            switch(status){
                case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                    console.log("Permission not requested");
                    break;
                case cordova.plugins.diagnostic.permissionStatus.DENIED:
                    console.log("Permission denied");
                    break;
                case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                    console.log("Permission granted always");
                    break;
                case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                    console.log("Permission granted only when in use");
                    break;
            }
        }, function(error){
            console.error(error);
        }, cordova.plugins.diagnostic.runtimePermissionGroups.STORAGE);
        }else{
          $ionicHistory.goBack()
        }
      })
    }
  }
})

.directive('onLongPress', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $elm, $attrs) {
      $elm.bind('touchstart', function(evt) {
        // Locally scoped variable that will keep track of the long press
        $scope.longPress = true;

        // We'll set a timeout for 600 ms for a long press
        $timeout(function() {
          if ($scope.longPress) {
            // If the touchend event hasn't fired,
            // apply the function given in on the element's on-long-press attribute
            $scope.$apply(function() {
              $scope.$eval($attrs.onLongPress)
            });
          }
        }, 800);
      });
      $elm.bind('touchend', function (evt) {
        // Prevent the onLongPress event from firing
        $scope.longPress = false;
        // If there is an on-touch-end function attached to this element, apply it
        if ($attrs.onTouchEnd) {
          $scope.$apply(function () {
            $scope.$eval($attrs.onTouchEnd)
          });
        }
      })
    }
  };
})

.filter('bytes', function () {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-'
    if (typeof precision === 'undefined') precision = 1
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number]
  }
})

  .directive('renderHtml', function ($compile, $sce, domainENT) {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        downloadFile: '&',
        openUrl: '&'
      },
      link: function (scope, element) {

        if (scope.data != null) {

          scope.data = scope.data.replace(/href="(https?:\/\/.+)\/"/g, 'ng-click="openUrl({url: \'$1\'})"');

          scope.data = scope.data.replace(/<a href="([\/\w\d-]+)"><div class="download"><\/div>(\S+)<\/a>/g, '<a ng-click="downloadFile({fileName: \'$2\', urlFile: \'' + domainENT + '$1\'})"><div class="download"><\/div>$2<\/a>');
          scope.data = scope.data.replace(/<img src="(\/[\S]+)"/g, "<img http-src=\"" + domainENT + "$1\" ");

          scope.data = $sce.trustAsHtml(scope.data);
          element.html(scope.data);
          $compile(element)(scope);
        }
      }
    }
  });

function setProfileImage (regularPath, userId){
  return (regularPath != null && regularPath.length > 0 && regularPath != "no-avatar.jpg") ? regularPath:"/userbook/avatar/"+userId;
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

  var printDirPath = function(entry){
    console.log("Dir path - " + entry.fullPath);
  }

  createDirectory("ENT/conversation", printDirPath);
  createDirectory("ENT/workspace", printDirPath);
}

function createDirectory(path, success){
  var dirs = path.split("/").reverse();
  var root = window.FS.root;

  var createDir = function(dir){
    root.getDirectory(dir, {
      create : true,
      exclusive : false
    }, successCB, failCB);
  };

  var successCB = function(entry){
    console.log("dir created " + entry.fullPath);
    root = entry;
    if(dirs.length > 0){
      createDir(dirs.pop());
    }else{
      console.log("all dir created");
      success(entry);
    }
  };

  var failCB = function(){
    console.log('failed to create dir ' + dir);
  };

  createDir(dirs.pop());
}
