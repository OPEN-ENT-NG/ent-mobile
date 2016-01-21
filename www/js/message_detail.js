angular.module('ent.message_detail', [])


.controller('MessagesDetailCtrl', function($scope, $http, $stateParams, $sce){
  $http.get("https://recette-leo.entcore.org/conversation/message/"+$stateParams.idMessage).then(function(resp){
    $scope.mail = resp.data;

  }, function(err){
    alert('ERR:'+ err);
  });

  $scope.downloadAttachment = function (id){

    //var attachmentUrl ="https://recette-leo.entcore.org/workspace/document/ec41e759-3def-48ad-a787-43347eb49d72";
    var attachmentUrl = "https://recette-leo.entcore.org/conversation/message/"+$scope.mail.id+"/attachment/"+id;

    var attachment = findElementById($scope.mail.attachments, id);
    $scope.downloadFile(attachment.filename, attachmentUrl,attachment.contentType);
  }

  // $scope.mail =
  // {
  //   id: "427ec14f-35c9-49d6-81cb-5d04b2e0e538",
  //   to:[
  //     "ae5e8a4e-0784-4fa0-aa76-27d49a23e941"
  //   ],
  //   cc:
  //   [
  //     "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba"
  //   ],
  //   from: "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
  //   state: "SENT",
  //   subject: "RECETTE DE LEO 2",
  //   date: 1430404331680,
  //   body: "<p class=\"ng-scope\">Je souhaite bon courage &agrave; ceux qui doivent r&eacute;aliser la recette de LEO V 2.</p><p class=\"ng-scope\">et je teste par la m&ecirc;me occasion l&#39;&eacute;diteur de textes :</p><p class=\"ng-scope\">&nbsp;</p><ol class=\"ng-scope\"><li><strong>en gras</strong></li><li><em>en italique</em></li><li><u>soulign&eacute;</u></li><li><span style=\"color:#0000FF;\">en couleur</span></li><li>avec un&nbsp;<img title=\"Rêveur\" alt=\"Rêveur\" width=\"40\" height=\"40\" src=\"/assets/themes/leo/default/../img/icons/dreamy.png\" /></li><li>ou en ins&eacute;rant une image</li></ol><p class=\"ng-scope\"><a href=\"/workspace/document/274d1011-a1b3-4331-85bc-76ee4add6ef1?thumbnail=834x0\" target=\"_blank\"><img src=\"/workspace/document/274d1011-a1b3-4331-85bc-76ee4add6ef1?thumbnail=834x0\" /></a>​​​​​​</p><p class=\"ng-scope\">Et avec une pi&egrave;ce jointe !</p>",
  //   toName: null,
  //   ccName: null,
  //   fromName: null,
  //   displayNames:
  //   [
  //     [
  //       "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
  //       "Aurélie DROUILLAC"
  //     ],
  //     [
  //       "ae5e8a4e-0784-4fa0-aa76-27d49a23e941",
  //       "Steven Vergne (Intendance)"
  //     ],
  //     [
  //       "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
  //       "FREDERIC D'AMICO"
  //     ]
  //   ],
  //   attachments:
  //   [
  //     {
  //       id: "cfecac29-2afe-4dfb-9400-842760eb8bfc",
  //       name: "file",
  //       charset: "UTF-8",
  //       filename: "TEST - Espace numérique de travail.docx",
  //       contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //       contentTransferEncoding: "7bit",
  //       size: 211108
  //     }
  //
  //   ],
  //   systemFolders:
  //   [
  //     "INBOX"
  //
  //   ]
  // }

  // console.log($scope.mail);
});
