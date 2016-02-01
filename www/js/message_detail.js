angular.module('ent.message_detail', [])

.service('MessageDetailService', function(domainENT, $http){

  this.getMessage = function(id){
    var promise = $http.get(domainENT+"/conversation/message/"+id);
    return promise;
  }

  this.trashMessage = function (id){
    console.log("trash "+id);
    $http.put(domainENT+"/conversation/trash/?id="+id).then(function(resp){
      alert("trashed");
    }, function(err){
      alert('ERR:'+ err);
    });
  }
})

.controller('MessagesDetailCtrl', function($scope, $http, $stateParams, $rootScope, $state, domainENT, MessageDetailService){

  MessageDetailService.getMessage($stateParams.idMessage).then(function (response) {
    $scope.mail = response.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.isDraft =  function(){
    return "DRAFT" === $rootScope.nameFolder;
  }

  $scope.trash = function(id){
    MessageDetailService.trashMessage(id);
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
});
