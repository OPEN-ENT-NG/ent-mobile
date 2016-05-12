angular.module('ent', ['ionic', 'ngCordova', 'ngCookies','ngSanitize', 'ngRoute','ent.actualites','ent.blog','ent.blog-list','ent.auth',
'ent.messagerie','ent.workspace','ent.user','angularMoment','ent.test', 'ng-mfb'])

// .value("domainENT", "https://ent.picardie.fr")
// .value("domainENT", "https://preprod-leo.entcore.org")
.value("domainENT", "https://recette-leo.entcore.org")

.run(function($ionicPlatform, $ionicLoading, $rootScope,$cordovaGlobalization, amMoment) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    if (ionic.Platform.isIOS()){
      setTimeout(function () {
        navigator.splashscreen.hide();
      }, 3000 - 1000);
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
    $ionicConfigProvider.scrolling.jsScrolling(false);
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
        templateUrl: 'messagerie/detail.html'
      }
    }
  })
  .state('app.new_message', {
    url: '/new_message',
    views: {
      'menuContent': {
        templateUrl: 'messagerie/new_message.html'
      }
    }
  })

  .state('app.blog-list', {
    url: '/blog-list',
    views: {
      'menuContent': {
        templateUrl: 'blogs/blog-list.html',
        controller: "BlogListCtrl"
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
        templateUrl: 'actualites/actualites.html'
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

  .state('app.test', {
    url: '/test',
    views: {
      'menuContent': {
        templateUrl: 'test/input_file.html'
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'authentification/login-credentials.html',
    controller: 'LoginCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
  // $urlRouterProvider.otherwise('/app/workspace/documents');

})

.controller('AppCtrl', function ($scope, $rootScope, $sce, $state, $cordovaInAppBrowser, $cordovaFileTransfer,$cordovaProgress, $cordovaFileOpener2, domainENT, $ionicHistory, SkinFactory, $ionicPopup, ActualitesService, MessagerieServices, BlogsService, WorkspaceService, $filter){

  SkinFactory.getSkin().then(function(res) {
    localStorage.setItem('skin', res.data.skin);
  } , function(err){
    $scope.showAlertError(err);
  });

  getTranslationActualites();
  getTranslationConversation();
  getTraductionBlogs();
  getTraductionWorkspace();


  $scope.renderHtml = function (text){
    if(text != null){
      text = text.replace(/="\/\//g, "=\"https://");
      text = text.replace(/="\//g, "=\""+domainENT+"/");

      //pb dans le cas de téléchargement de fichiers
      // var newString = text.replace(/href="([\S]+)"/g, "onClick=window.plugins.fileOpener.open(\"$1\")")
      var newString = text.replace(/href="([\S]+)"/g, "onClick=\"window.open('$1', '_blank', 'location=no')\"");

      // console.log(newString);
      return $sce.trustAsHtml(newString);
    }
  }

  $scope.downloadFile = function (filename, urlFile, fileMIMEType, module){
    // Save location
    var url = $sce.trustAsResourceUrl(urlFile);
    var targetPath = window.FS.root.nativeURL+"ENT/"+module+"/" + filename; //revoir selon la platforme
    console.log(targetPath);

    $cordovaProgress.showSimpleWithLabelDetail(true, "Téléchargement en cours", filename);
    $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
      $cordovaProgress.hide();
      $scope.openLocalFile(targetPath, fileMIMEType);

    }, function (error) {
      $cordovaProgress.hide();
      $scope.showAlertError(error);
    }, function (progress) {
    });
  }

  $scope.openLocalFile = function (targetPath, fileMIMEType){

    $cordovaFileOpener2.open(
      targetPath,
      fileMIMEType,
      {
        error : function(){
          $scope.showAlertError(error);
        },
        success : function(){ }
      }
    );
  }

  $scope.getImageUrl= function(path){
    if(path){
      return domainENT+path;
    }
  }

  $scope.setCorrectImage = function(path, defaultImage){
    var result;
    if(path != null && path.length > 0){
      result = path;
    } else {
      if(!localStorage.getItem('skin')){
        SkinFactory.getSkin().then(function(res) {
          localStorage.setItem('skin', res.data.skin);
          console.log(localStorage.getItem('skin'));
          result = localStorage.getItem('skin')+defaultImage;
        });
      } else {
        result = localStorage.getItem('skin')+defaultImage;
      }
    }
    return result;
  }

  var getDateAsMoment = function(date){
    var momentDate;
    if(moment.isMoment(date)) {
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

  $scope.getSizeFile = function (file){
    return $filter('bytes')(file.size);
  }

  // An alert dialog
  $scope.showAlertError = function(error) {
    console.log(error);
    var alertPopup = $ionicPopup.alert({
      title: 'Erreur de connexion',
      template: "Nous recontrons actuellement des problèmes. Veuillez réessayer dans quelques instants."
    });

    alertPopup.then(function(res) {
      $ionicHistory.goBack();
    });
  };

  $scope.logout = function(){
    localStorage.clear();
    $ionicHistory.clearHistory()
    $ionicHistory.clearCache();
    navigator.splashscreen.show();
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
      $rootScope.translationActus = resp.data;
    }, function(err){
      $scope.showAlertError(err);
    });
  }

  function getTranslationConversation(){
    MessagerieServices.getTranslation().then(function(resp) {
      $rootScope.translationConversation = resp.data;
    }), function(err){
      alert('ERR:'+ err);
    };
  }

  function getTraductionBlogs(){
    BlogsService.getTraduction().then(function(resp){
      $rootScope.translationBlog = resp.data;

      $rootScope.translationBlog["filters.drafts"] = $rootScope.translationBlog["filters.drafts"].substring(0,$rootScope.translationBlog["filters.drafts"].indexOf('(')-1);
      $rootScope.translationBlog["filters.submitted"] = $rootScope.translationBlog["filters.submitted"].substring(0,$rootScope.translationBlog["filters.submitted"].indexOf('(')-1);

    }), function(err){
      alert('ERR:'+ err);
    }
  }

  function getTraductionWorkspace(){
    WorkspaceService.getTranslation().then(function(resp) {
      $rootScope.translationWorkspace = resp.data;
    }), function(err){
      alert('ERR:'+ err);
    };
  }
})
.directive('appVersion', function () {
  return function(scope, elm, attrs) {
    cordova.getAppVersion(function (version) {
      elm.text(version);
    });
  };
})
.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
    number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
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
    console.log("create dir " + dir);
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
    console.log("failed to create dir " + dir);
  };

  createDir(dirs.pop());
}
