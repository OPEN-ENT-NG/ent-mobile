angular.module('ent.message_detail', ['ent.message_services'])

.controller('MessagesDetailCtrl', function($scope, $rootScope, $ionicPopover, $state, domainENT, MessagerieServices,  $ionicLoading, $ionicHistory, DeleteMessagesPopupFactory,MoveMessagesPopupFactory){

  getMessage();

  $scope.isDraft =  function(){
    return "draft" === $rootScope.nameFolder;
  }

  $scope.isInbox =  function(){
    return "inbox" === $rootScope.nameFolder;
  }

  $scope.isTrash =  function(){
    return "trash" === $rootScope.nameFolder;
  }

  $scope.trash = function(id){
    DeleteMessagesPopupFactory.getPopup().then(function(res){
      if(res){
        $ioniLoading.show({
          template: 'Chargement en cours...'
        });
        MessagerieServices.trashMessage(id, $rootScope.nameFolder).then(function(){
          $ionicLoading.hide();
          $ionicHistory.clearCache();
          $ionicHistory.goBack();
        }, function(err){
          $scope.showAlertError();
        });
      }
    })
  }
  $scope.moveMessage = function(id){
    var popupMove = MoveMessagesPopupFactory.getPopup($scope);
    popupMove.then(function(res){

      $ionicLoading.show({
        template: '<i class="spinnericon- taille"></i>'
      });
      console.log(res);
      if(res!=null){
        MessagerieServices.moveMessage(id, res).then(function(){
          $ionicHistory.goBack();
        }, function(err){
          $scope.showAlertError();
        });
      }
      $ionicLoading.hide();
    })
  }

  $scope.restoreMessage = function(message){
    $ionicLoading.show({
      template: '<i class="spinnericon- taille"></i>'
    });
    MessagerieServices.restoreSelectedMessages(message).then(function(){
      $ionicHistory.goBack();
    }, function(err){
      $scope.showAlertError();
    });
    $ionicLoading.hide();
  }
  
  $scope.editMail = function(action){
    $scope.mail.action = action;
    goToNewMail();
  }

  $ionicPopover.fromTemplateUrl('messagerie/popover_messagerie_detail.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  })

  function goToNewMail(){
    $rootScope.historyMail = $scope.mail;
    console.log($rootScope.historyMail.action);
    $state.go('app.new_message');
  }

  $scope.downloadAttachment = function (id){
    var attachmentUrl = domainENT+"/conversation/message/"+$scope.mail.id+"/attachment/"+id;
    var attachment = findElementById($scope.mail.attachments, id);
    $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType);
  }

  function getMessage(){
    $ionicLoading.show({
      template: 'Chargement en cours...'
    });
    MessagerieServices.getMessage($state.params.idMessage).then(function(res) {
      $scope.mail = res.data;
      $ionicLoading.hide();
    }, function(err){
      $scope.showAlertError();
    });
  }
});
