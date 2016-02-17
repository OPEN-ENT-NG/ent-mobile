angular.module('ent.message_detail', [])

.service('MessageDetailService', function(domainENT, $http){

  this.getMessage = function(id){
    return $http.get(domainENT+"/conversation/message/"+id);
  }

  this.trashMessage = function (id){
    return $http.put(domainENT+"/conversation/trash?id="+id);
  }
})

.controller('MessagesDetailCtrl', function($scope, $stateParams, $rootScope, $state, domainENT, MessageDetailService,  $ionicLoading, $ionicHistory){

  getMessage($stateParams.idMessage);

  $scope.isDraft =  function(){
    return "DRAFT" === $rootScope.nameFolder;
  }

  $scope.trash = function(id){
    MessageDetailService.trashMessage(id).then(function(){
      $ionicHistory.clearCache();
      $ionicHistory.goBack(-1);
    });
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
    $scope.mail.unshift(getMessage(id));
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply()
  }

  function getMessage(){
    $ionicLoading.show({
      template: 'Chargement en cours...'
    });
    MessageDetailService.getMessage($stateParams.idMessage).then(function(res) {
      $scope.mail = res.data;
      console.log($scope.mail);
      $ionicLoading.hide();
    }, function(err){
      alert('ERR:'+ err);
    });
  }
});
