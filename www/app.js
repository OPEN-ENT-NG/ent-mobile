angular.module('ent', ['ionic', 'ngCordova', 'ngCookies','ngSanitize', 'ngRoute','ent.actualites','ent.blog','ent.blog-list','ent.auth', 'ent.messagerie', 'ent.new_message','ent.user','angularMoment'])

.value("domainENT", "https://recette-leo.entcore.org")

.run(function($ionicPlatform, $ionicLoading, $rootScope,$cordovaGlobalization,amMoment) {

  $cordovaGlobalization.getPreferredLanguage().then( function(result) {
    console.log("new locale: "+result.value);
    amMoment.changeLocale(result.value);
  }, function(error) {
    console.log(error);
  })

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
    // $rootScope.$on('loading:show', function() {
    //   $ionicLoading.show({template: 'foo'})
    // })
    //
    // $rootScope.$on('loading:hide', function() {
    //   $ionicLoading.hide()
    // })


  });
})

.config(function($stateProvider, $urlRouterProvider, $routeProvider, $ionicConfigProvider,  $httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        if (localStorage.getItem('access_token')) {
          config.headers['Authorization'] = 'Bearer '+localStorage.getItem('access_token')
          console.log("localStorage.getItem('access_token') "+localStorage.getItem('access_token'));
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

  .state('app.espace_doc', {
    url: '/espace_doc',
    views: {
      'menuContent': {
        templateUrl: 'templates/espace_doc.html'
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

  .state('login', {
    url: '/login',
    templateUrl: 'authentification/login-credentials.html',
    controller: 'LoginCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})

.controller('AppCtrl', function ($scope, $sce, $state, $cordovaInAppBrowser, $cordovaFileTransfer,$cordovaProgress, $cordovaFileOpener2, domainENT, $ionicHistory, SkinFactory){



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

  $scope.downloadFile = function (filename, urlFile, fileMIMEType){
    // Save location
    var url = $sce.trustAsResourceUrl(urlFile);
    var targetPath = cordova.file.externalRootDirectory + filename; //revoir selon la platforme

    $cordovaProgress.showSimpleWithLabelDetail(true, "Téléchargement en cours", filename);
    $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
      $cordovaProgress.hide();
      $scope.openLocalFile(targetPath, fileMIMEType);

    }, function (error) {
      alert('Error');
    }, function (progress) {
    });
  }

  $scope.openLocalFile = function (targetPath, fileMIMEType){

    $cordovaFileOpener2.open(
      targetPath,
      fileMIMEType,
      {
        error : function(){ alert("nope") },
        success : function(){ }
      }
    );
  }

  $scope.getImageUrl= function(path){
    if(path!=null && path!= ""){
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
      }
      result = localStorage.getItem('skin')+defaultImage;
    }
    console.log(result);
    return result;
  }

  $scope.setProfileImage = function (regularPath, userId){
    return (regularPath != null && regularPath.length > 0 && regularPath != "no-avatar.jpg") ? regularPath:"/userbook/avatar/"+userId;
  }

  var getDateAsMoment = function(date){
    var momentDate;
    if(moment.isMoment(date)) {
      momentDate = date;
    }
    else if (date.$date) {
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

  $scope.logout = function(){
    localStorage.clear();
    $ionicHistory.clearHistory()
    $state.go("login");
    window.cookies.clear(function() {
      console.log('Cookies cleared!');
    });
    // ionic.Platform.exitApp(); // stops the app
  }
})

.directive('appVersion', function () {
  return function(scope, elm, attrs) {
    cordova.getAppVersion(function (version) {
      elm.text(version);
    });
  };
});

function findElementById(arraytosearch, valuetosearch) {

  for (var i = 0; i < arraytosearch.length; i++) {
    if (arraytosearch[i].id == valuetosearch) {
      return arraytosearch[i];
    }
  }
  return null;
}
