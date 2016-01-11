angular.module('ent.message_detail', [])


.controller('MessagesDetailCtrl', function($scope, $http, $stateParams){
  $http.get("https://recette-leo.entcore.org/conversation/message/"+$stateParams.idMessage).then(function(resp){
    $scope.mail = resp.data;

  }, function(err){
    alert('ERR:'+ err);
  });


  // $scope.mail =
  //   {
  //     id: "057af9f4-00c4-4080-9f86-5ab7aaf8c98a",
  //     to:
  //     [
  //       "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba"
  //     ],
  //     cc: [ ],
  //     from: "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
  //     state: "SENT",
  //     subject: "Re : Resize image",
  //     body: "<p class=\"ng-scope\">&nbsp;</p><p class=\"ng-scope\"><div><div><br></div><div><audio src=\"/workspace/document/1205d761-f2a4-4306-9bf8-7921d1f5fef2\" controls=\"\" draggable=\"\" native=\"\"></audio></div><div><br></div></div><br></p><p class=\"ng-scope\"><br></p><p class=\"row ng-scope\"></p><hr class=\"ng-scope\"><p class=\"ng-scope\"></p>\n<p class=\"medium-text ng-scope\">\n\t<span translate=\"\" key=\"transfer.from\"><span class=\"no-style ng-scope\">De : </span></span><em class=\"ng-binding\">Aurélie DROUILLAC</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.date\"><span class=\"no-style ng-scope\">Date: </span></span><em class=\"ng-binding\">lundi 11 janvier 2016</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.subject\"><span class=\"no-style ng-scope\">Objet : </span></span><em class=\"ng-binding\">Resize image</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.to\"><span class=\"no-style ng-scope\">A : </span></span>\n\t<!-- ngRepeat: receiver in mail.to --><em class=\"medium-importance ng-scope ng-binding\" ng-repeat=\"receiver in mail.to\">\n\t\tFREDERIC D'AMICO<!-- ngIf: $index !== mail.to.length - 1 && receiver.displayName -->\n\t</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.cc\"><span class=\"no-style ng-scope\">Copie à : </span></span>\n\t<!-- ngRepeat: receiver in mail.cc -->\n</p><blockquote class=\"ng-scope\"><p class=\"ng-scope\">&nbsp;</p><p class=\"row ng-scope\"></p><div><div><img src=\"/workspace/document/ccfc822f-a09c-45f9-9927-f8b2d94a6a59\" draggable=\"\" native=\"\" style=\"width: 124px; float: none; margin: auto; cursor: ew-resize;\"></div></div><br><hr class=\"ng-scope\"><p class=\"ng-scope\"></p>\n<p class=\"medium-text ng-scope\">\n\t<span translate=\"\" key=\"transfer.from\"><span class=\"no-style ng-scope\">De : </span></span><em class=\"ng-binding\">Aurélie DROUILLAC</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.date\"><span class=\"no-style ng-scope\">Date: </span></span><em class=\"ng-binding\">lundi 11 janvier 2016</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.subject\"><span class=\"no-style ng-scope\">Objet : </span></span><em class=\"ng-binding\">(no subject)</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.to\"><span class=\"no-style ng-scope\">A : </span></span>\n\t<!-- ngRepeat: receiver in mail.to --><!-- ngRepeat: receiver in mail.to --><em class=\"medium-importance ng-scope ng-binding\" ng-repeat=\"receiver in mail.to\">\n\t\tAurélie DROUILLAC<!-- ngIf: $index !== mail.to.length - 1 && receiver.displayName -->\n\t</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.cc\"><span class=\"no-style ng-scope\">Copie à : </span></span>\n\t<!-- ngRepeat: receiver in mail.cc -->\n</p><blockquote class=\"ng-scope\"><div>TTest</div><div></div></blockquote><div></div><div></div><div></div><div></div></blockquote><div></div>",
  //     toName: null,
  //     ccName: null,
  //     fromName: null,
  //     displayNames:
  //     [
  //
  //       [
  //
  //         "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
  //         "Aurélie DROUILLAC"
  //
  //       ],
  //
  //       [
  //         "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
  //         "FREDERIC D'AMICO"
  //       ]
  //
  //     ],
  //     attachments: [ ],
  //     systemFolders:
  //     [
  //
  //       "INBOX"
  //
  //     ]
  //   };
});
