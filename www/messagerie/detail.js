angular.module('ent.message_detail', ['ent.message_services'])

.controller('MessagesDetailCtrl', function($scope, $rootScope, $state, domainENT, MessagerieServices,  $ionicLoading, $ionicHistory, DeleteMessagesPopupFactory,MoveMessagesPopupFactory){

  getMessage($state.params.idMessage);

  $scope.isDraft =  function(){
    console.log($rootScope.nameFolder);
    return "draft" === $rootScope.nameFolder;
  }

  $scope.trash = function(id){
    DeleteMessagesPopupFactory.getPopup().then(function(res){
      if(res){
        $ionicLoading.show({
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
    $rootScope.historyMail = $scope.mail;
    $state.go('app.new_message');
  }

  $scope.downloadAttachment = function (id){
    var attachmentUrl = domainENT+"/conversation/message/"+$scope.mail.id+"/attachment/"+id;
    var attachment = findElementById($scope.mail.attachments, id);
    $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType);
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
