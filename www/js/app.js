angular.module('ent', ['ionic', 'ngCordova', 'ngCookies','ngSanitize', 'ngRoute','ent.controllers','ent.actualites','ent.blog','ent.auth', 'ent.messagerie', 'ent.message_folder'])

.run(function($ionicPlatform) {
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
  });
})

.config(function($stateProvider, $urlRouterProvider, $routeProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.messagerie', {
    url: '/messagerie',
    views: {
      'menuContent': {
        templateUrl: 'templates/messagerie.html',
        controller: 'MessagerieFoldersCtrl'
      }
    }
  })

  .state('app.message_folder', {
    url: '/messagerie/:nameFolder',
    views: {
      'menuContent': {
        templateUrl: 'templates/message_folder.html',
        controller: 'InboxCtrl'
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
        templateUrl: 'templates/blog-list.html',
        controller: "BlogListCtrl",
        resolve: {
          blogs: function (serviceBlog){
            return serviceBlog.getAllBlogs();
          }
        }
      }
    }
  })

  .state('app.blog', {
    url: '/blog/:index',
    views: {
      'menuContent': {
        templateUrl: 'templates/blog.html',
        controller: "BlogCtrl",
        resolve: {
          blog: function(serviceBlog, $stateParams){
            return serviceBlog.getBlog($stateParams.index);
          }
        }
      }
    }
  })

  .state('app.actualites', {
    url: '/actualites',
    views: {
      'menuContent': {
        templateUrl: 'templates/actualites.html'
      }
    }
  })

  .state('app.threads', {
    url: '/threads',
    views: {
      'menuContent': {
        templateUrl: 'templates/threads.html'
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login-credentials.html',
    controller: 'LoginCtrl'
  });

  // $routeProvider
  // .when('/:folderName',{
  //     views: {
  //       'menuContent': {
  //         templateUrl: 'templates/message_folder.html',
  //         controller: 'InboxCtrl'
  //       }
  //     }
  // })
  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/login');
  $urlRouterProvider.otherwise('/app/messagerie');
});
