angular.module('ent.message_detail', ['ent.message_services'])

.controller('MessagesDetailCtrl', function($scope, $rootScope, $ionicPopover, $state, domainENT, MessagerieServices,  $ionicLoading, $ionicHistory, DeleteMessagesPopupFactory,MoveMessagesPopupFactory, AlertMessagePopupFactory){

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
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        MessagerieServices.trashMessage(id, $rootScope.nameFolder).then(function(){
          $ionicLoading.hide();
          AlertMessagePopupFactory.getPopup($rootScope.translationConversation["delete"], "Message(s) supprimé(s)").then(function() {
            $ionicHistory.clearCache();
            $ionicHistory.goBack();
          })
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
        template: '<ion-spinner icon="android"/>'
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
      template: '<ion-spinner icon="android"/>'
    });
    MessagerieServices.restoreSelectedMessages(message).then(function(){
      $ionicHistory.goBack();
    }, function(err){
      $scope.showAlertError();
    });
    $ionicLoading.hide();
  }

  $scope.editMail = function(action){
    console.log("edit");
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
    console.log($rootScope.historyMail);
    $state.go('app.new_message');
  }

  $scope.downloadAttachment = function (id){
    var attachmentUrl = domainENT+"/conversation/message/"+$scope.mail.id+"/attachment/"+id;
    var attachment = findElementById($scope.mail.attachments, id);
    $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType, "conversation");
  }

  function getMessage(){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    MessagerieServices.getMessage($state.params.idMessage).then(function(res) {
      $scope.mail = res.data;
      $scope.mail.from = getArrayNames([res.data.from], res.data);
      $scope.mail.to = getArrayNames(res.data.to, res.data);
      $scope.mail.cc = getArrayNames(res.data.cc, res.data);
      console.log($scope.mail);
      $ionicLoading.hide();
    }, function(err){
      $scope.showAlertError();
    });
  }

  function getArrayNames(ids, mail){
    var names = [];

    for(var i=0; i< ids.length; i++){
      names.push({
        id: ids[i],
        displayName: $rootScope.getRealName(ids[i], mail.displayNames),
        entId: i
      });
    }
    return names;
  }
});
