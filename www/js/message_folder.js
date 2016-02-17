angular.module('ent.message_folder', ['ent.message_services'])

.controller('InboxCtrl', function($scope, $state, $stateParams, $rootScope, domainENT, MessagerieServices,  $ionicLoading,  $cordovaVibration, $ionicHistory, $ionicPlatform){
  var url = "";
  var regularFolders = ["INBOX", "OUTBOX", "TRASH", "DRAFT"];

  updateMessages();

  $scope.enableCheckMessages = function (index) {
    if(!$scope.checkable){
      $cordovaVibration.vibrate(100);     // Vibrate 100ms
      $scope.checkable = true;
      $scope.checkMessage (index);
    }
  }

  $scope.deleteSelectedMessages = function(){
    var messagesList = getSelectedMessages();
    if(messagesList.length >0){
      $ionicLoading.show({
        template: 'Chargement en cours...'
      });

      MessagerieServices.deleteSelectedMessages(messagesList, $rootScope.nameFolder).then(function(){
        updateMessages();
        $ionicLoading.hide();
      }, function(err){
        alert('ERR:'+ err);
      });
    }
  }

  $scope.checkMessage = function(index){
    $scope.messages[index].checked = !$scope.messages[index].checked;
  }

  $scope.doAction = function(index){
    $scope.checkable ?  $scope.checkMessage(index):goToMessage(index)
  }

  $scope.getCountOfCheckedMessages = function(){
    return getSelectedMessages().length;
  }

  function getSelectedMessages(){
    var array = [];
    angular.forEach($scope.messages, function(message){
      if(message.checked){
        array.push(message);
      }
    });
    return array;
  }

  $scope.showNumberOfCheckedMessages = function(){
    return $scope.checkable ? $rootScope.nameFolder: getCountOfCheckedMessages();
  }

  $rootScope.$ionicGoBack = function() {
    if($scope.checkable){
      $scope.checkable = false;
      initCheckedValue();
    } else {
      $ionicHistory.goBack();
    }
  };

  var doCustomBack= function() {
    if($scope.checkable){
      $scope.checkable = false;
      initCheckedValue();
      $scope.$apply();
    } else {
      $ionicHistory.goBack();
    }
  };

  var deregisterHardBack= $ionicPlatform.registerBackButtonAction(doCustomBack, 101);
  $scope.$on('$destroy', function() {
    deregisterHardBack();
  });

  $scope.doRefreshMessages = function() {
    $scope.messages.unshift(getMessages(url));
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  $scope.getRealName = function(id, message){
    var returnName = "Inconnu";
    for(var i = 0; i< message.displayNames.length; i++){
      if(id == message.displayNames[i][0]){
        returnName = message.displayNames[i][1];
      }
    }
    return returnName;
  }

  function updateMessages(){
    $scope.checkable = false;
    getUrlFolder();
    getMessages(url);
  }

  function getUrlFolder (){
    if(regularFolders.indexOf($stateParams.nameFolder)>-1){
      url=domainENT+"/conversation/list/"+$stateParams.nameFolder;
      $rootScope.nameFolder = $stateParams.nameFolder;
    } else {
      url=domainENT+"/conversation/list/"+localStorage.getItem("messagerie_folder_id")+"?restrain=&page=0";
      $rootScope.nameFolder = localStorage.getItem("messagerie_folder_name");
    }
  }

  function getMessages (url){
    $ionicLoading.show({
      template: 'Chargement en cours...'
    });
    MessagerieServices.getMessagesFolder(url).then(function (response) {
      $scope.messages = response.data;
      initCheckedValue();
      $ionicLoading.hide();
    }, function(err){
      $ionicLoading.hide();
      alert('ERR:'+ err);
    });
  };

  function initCheckedValue(){
    angular.forEach($scope.messages, function(message){
      message.checked = false;
    });
  }

  function goToMessage(index){
    $state.go('app.message_detail', {nameFolder: $rootScope.nameFolder, idMessage: $scope.messages[index].id});
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
        }, 600);
      });

      $elm.bind('touchend', function(evt) {
        // Prevent the onLongPress event from firing
        $scope.longPress = false;
        // If there is an on-touch-end function attached to this element, apply it
        if ($attrs.onTouchEnd) {
          $scope.$apply(function() {
            $scope.$eval($attrs.onTouchEnd)
          });
        }
      });
    }
  };
});
