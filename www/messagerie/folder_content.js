angular.module('ent.message_folder', ['ent.message_services'])

.controller('InboxCtrl', function($scope, $state, $stateParams, $rootScope, domainENT, MessagerieServices,  $ionicLoading,  $cordovaVibration, $ionicHistory, $ionicPlatform, MoveMessagesPopupFactory, DeleteMessagesPopupFactory){
  var url = "";
  var regularFolders = ["INBOX", "OUTBOX", "TRASH", "DRAFT"];

  updateMessages();

  $scope.restoreMessages = function(){
    MessagerieServices.restoreSelectedMessages(getSelectedMessages()).then(function(){
      updateMessages();
    }
    , function(err){
      alert('ERR:'+ err);
      $ionicLoading.hide();
    });
  }

  $scope.canShowRestore = function(){
    return $rootScope.nameFolder == "TRASH" && $scope.checkable;
  }

  $scope.showPopupMove = function(){
    var popupMove = MoveMessagesPopupFactory.getPopup($scope);
    popupMove.then(function(res){

      $ionicLoading.show({
        template: '<i class="spinnericon- taille"></i>'
      });
      console.log(res);
      $ionicLoading.hide();
      if(res!=null){
        MessagerieServices.moveMessages(getSelectedMessages(), res).then(function(){
          updateMessages();
        }
        , function(err){
          alert('ERR:'+ err);
          $ionicLoading.hide();
        });
      }
    })
  }

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

      DeleteMessagesPopupFactory.getPopup().then(function(res){
        if(res){
          $ionicLoading.show({
            template: '<i class="spinnericon- taille"></i>'
          });

          MessagerieServices.deleteSelectedMessages(messagesList, $rootScope.nameFolder).then(function(){
            updateMessages();
            $ionicLoading.hide();
          }, function(err){
            alert('ERR:'+ err);
          });
        }
      })
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
      template: '<i class="spinnericon- taille"></i>'
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
});
