angular.module('ent.message_folder', ['ent.message_services'])

.controller('InboxCtrl', function($scope, $state, $stateParams, $rootScope, domainENT, MessagerieServices,  $ionicLoading,  $cordovaVibration, $ionicHistory, $ionicPlatform, MoveMessagesPopupFactory, DeleteMessagesPopupFactory){

  $rootScope.nameFolder = $stateParams.nameFolder;
  getMessagesAndFolders();

  $scope.restoreMessages = function(){
    MessagerieServices.restoreSelectedMessages(getSelectedMessages()).then(function(){
      getMessagesAndFolders();
    }
    , function(err){
      $scope.showAlertError();
      $ionicLoading.hide();
    });
  }

  $scope.canShowRestore = function(){
    return $stateParams.nameFolder == "trash" && $scope.checkable;
  }

  $scope.showPopupMove = function(){
    var popupMove = MoveMessagesPopupFactory.getPopup($scope);
    popupMove.then(function(res){

      $ionicLoading.show({
        template: '<i class="spinnericon- taille"></i>'
      });
      console.log(res);
      if(res!=null){
        MessagerieServices.moveMessages(getSelectedMessages(), res).then(function(){
          getMessagesAndFolders();
        }, function(err){
          $scope.showAlertError();
        });
      }
      $ionicLoading.hide();
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
          MessagerieServices.deleteSelectedMessages(messagesList, $stateParams.nameFolder).then(function(){
            getMessagesAndFolders();
          }, function(err){
            $scope.showAlertError();
          });
        }
      })
    }
  }

  $scope.getNameFolder = function(folderName){
    var nonPersonnalFolders = ["inbox", "outbox", "draft", "trash"];
    return nonPersonnalFolders.indexOf(folderName) != -1 ? $rootScope.translationConversation[folderName]:folderName;
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
    return $scope.checkable ? $stateParams.nameFolder: getCountOfCheckedMessages();
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
    $scope.messages.unshift(updateMessages());
    $scope.extraFolders.unshift(getExtraFolders());
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getMessagesAndFolders(){
    $scope.nameFolder = $stateParams.nameFolder;
    updateMessages();
    getExtraFolders();
  }

  function updateMessages(){
    $scope.checkable = false;
    getMessages(getUrlFolder());
  }

  function getUrlFolder (){
    var regularFolders = ["INBOX", "OUTBOX", "TRASH", "DRAFT"];
    var url= domainENT+"/conversation/list/"+$stateParams.idFolder;
    if(regularFolders.indexOf($stateParams.idFolder) == -1) {
      url += "?restrain=&page=0";
    }
    console.log(url);
    return url;
  }

  function getMessages (url){
    $ionicLoading.show({
      template: '<i class="spinnericon- taille"></i>'
    });
    MessagerieServices.getMessagesFolder(url).then(function (response) {
      $scope.messages = response.data;
      initCheckedValue();
    }), function(err){
      $ionicLoading.hide();
      $scope.showAlertError();
    };
  };

  function getExtraFolders(){
    MessagerieServices.getExtraFolders($stateParams.idFolder).then(function(resp){
      console.log(resp.data);
      $scope.extraFolders = [];
      for(var i = 0; i< resp.data.length; i++){
        $scope.extraFolders.push({
          id: resp.data[i].id,
          name: resp.data[i].name,
          isPersonnal: true
        });
      }
    }).then(function(){
      var folderIds = [];
      angular.forEach($scope.extraFolders, function(extraFolder) {
        folderIds.push(extraFolder.id);
      })
      MessagerieServices.getCountUnread(folderIds).then(function (response){
        for(var i=0; i< response.length; i++){
          $scope.extraFolders[i].count = response[i].count;
        }
        $ionicLoading.hide();
      })
    }), function(err){
      $ionicLoading.hide();
      $scope.showAlertError();
    };
  }

  function initCheckedValue(){
    angular.forEach($scope.messages, function(message){
      message.checked = false;
    });
  }

  function goToMessage(index){
    $state.go('app.message_detail', {nameFolder: $stateParams.nameFolder, idMessage: $scope.messages[index].id});
  }
});
