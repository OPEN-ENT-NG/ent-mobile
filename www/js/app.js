angular.module('ent', ['ionic', 'ngCordova', 'ngCookies','ngSanitize', 'ngRoute','ent.controllers','ent.actualites','ent.blog','ent.blog-list','ent.auth', 'ent.messagerie', 'ent.message_folder','ent.message_detail', 'ent.new_message'])

.value("domainENT", "https://recette-leo.entcore.org")

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
    url: '/messagerie/folder/:nameFolder',
    views: {
      'menuContent': {
        templateUrl: 'templates/message_folder.html',
        controller: 'InboxCtrl'
      }
    }
  })

  .state('app.message_detail', {
    url: '/messagerie/id/:idMessage',
    views: {
      'menuContent': {
        templateUrl: 'templates/message_detail.html'
      }
    }
  })
  .state('app.new_message', {
    url: '/new_message',
    views: {
      'menuContent': {
        templateUrl: 'templates/new_message.html',
        controller: 'NewMessageCtrl'
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
        controller: "BlogListCtrl"
      }
    }
  })

  .state('app.blog', {
    url: '/blog/id/:idBlog',
    views: {
      'menuContent': {
        templateUrl: 'templates/blog.html',
        controller: "BlogCtrl"
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
  //$urlRouterProvider.otherwise('/app/messagerie');
});
