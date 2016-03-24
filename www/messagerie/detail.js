angular.module('ent.message_detail', ['ent.message_services'])

.controller('MessagesDetailCtrl', function($scope, $rootScope, $state, domainENT, MessagerieServices,  $ionicLoading, $ionicHistory, DeleteMessagesPopupFactory,MoveMessagesPopupFactory){

  getMessage($state.params.idMessage);

  $scope.isDraft =  function(){
    return "draft" === $rootScope.nameFolder;
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

  $scope.editMail = function(){
    $scope.mail.action = "DRAFT";
    goToNewMail();
  }

  $scope.replyMail = function(){
    $scope.mail.status = "REPLY_ONE";
    goToNewMail();
  }

  $scope.replyAllMail = function(){
    $scope.mail.action = "REPLY_ALL";
    goToNewMail();
  }

  $scope.forwardMail = function(){
    $scope.mail.action = "FORWARD";
    goToNewMail();
  }

  function goToNewMail(){
    $rootScope.historyMail = $scope.mail;
    console.log($rootScope.historyMail);
    $state.go('app.new_message');
  }

  $scope.downloadAttachment = function (id){
    var attachmentUrl = domainENT+"/conversation/message/"+$scope.mail.id+"/attachment/"+id;
    var attachment = findElementById($scope.mail.attachments, id);
    $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType);
  }

  $rootScope.getRealName = function(id, message){
    var returnName = "Inconnu";
    for(var i = 0; i< message.displayNames.length; i++){
      if(id == message.displayNames[i][0]){
        returnName = message.displayNames[i][1];
      }
    }
    return returnName;
  }

  $scope.doRefreshMail = function() {
    $scope.mail.unshift(getMessage($state.params.idMessage));
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
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
