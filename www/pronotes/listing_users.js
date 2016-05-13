angular.module('ent.listing_users', ['ngCordova'])

  .controller('ListingUsersCtrl', function ($scope, $rootScope, $window, $cordovaInAppBrowser ) {

    //console.log($rootScope.myUser);


    var scheme;
    $scope.searchIsActive = false ;
    if(device.platform === 'iOS') {
        // scheme = 'twitter://';
        scheme = 'pronote://';
    }
    else if(device.platform === 'Android') {
        // scheme = 'com.twitter.android';
        scheme = 'com.pronote.android';
    }


    $scope.openPronotes = function(id) {
      if(id!=null && id.length !=0){

        appAvailability.check(
          scheme, // URI Scheme
          function() {  // Success callback
              window.open('pronotes://user?screen_name=gajotres', '_system', 'location=no');
              console.log('Pronote is available');
          },
          function() {  // Error callback
              window.open('http://www.index-education.com/fr/pronote-info191-pronote-net.php', '_system', 'location=no');
              console.log('Pronote is not available');
          }
        );

        // try {
        //   $window.open("https://demo.index-education.net/pronote/mobile."+id+".html?fd=1");
        // } catch (e) {
        //   alert("Popup window blocked " + e.number);
        // }
      }
    };

    $scope.viewSearch = function(){
      $scope.searchIsActive = !$scope.searchIsActive ;
    }

  });
