angular.module('ent.message_detail', [])


.controller('MessagesDetailCtrl', function($scope, $http, $stateParams){
  // $http.get("https://recette-leo.entcore.org/conversation/message/"+$stateParams.idMessage).then(function(resp){
  //   $scope.mail = resp.data;
  //
  // }, function(err){
  //   alert('ERR:'+ err);
  // });


  $scope.mail =
  {
    id: "ef425730-4c36-4d11-90e3-495b7fcf4bb3",
    to: [
        "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba"
    ],
    cc: [],
    from: "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
    state: "SENT",
    subject: "Re : EDITEUR - TEST PALETTE COULEUR",
    date: 1452521886683,
    body: "<p class=\"ng-scope\" style=\"font-size: 24px; line-height: 24px;\">&nbsp;huieo jop</p><p class=\"ng-scope\" style=\"font-size: 42px; line-height: 42px;\">&nbsp;OIROP DK</p><p class=\"ng-scope\"><span style=\"color: rgb(255, 0, 0);\">&nbsp;AIO £ AIEJPAZ</span></p><p class=\"ng-scope\">£E AUIZEO ¨<span style=\"text-decoration: underline;\">DKPjioerjoep r</span></p><p class=\"ng-scope\"><br></p><p class=\"row ng-scope\"></p><hr class=\"ng-scope\"><p class=\"ng-scope\"></p>\n<p class=\"medium-text ng-scope\">\n\t<span translate=\"\" key=\"transfer.from\"><span class=\"no-style ng-scope\">De : </span></span><em class=\"ng-binding\">Aurélie DROUILLAC</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.date\"><span class=\"no-style ng-scope\">Date: </span></span><em class=\"ng-binding\">lundi 11 janvier 2016</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.subject\"><span class=\"no-style ng-scope\">Objet : </span></span><em class=\"ng-binding\">EDITEUR - TEST PALETTE COULEUR</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.to\"><span class=\"no-style ng-scope\">A : </span></span>\n\t<!-- ngRepeat: receiver in mail.to --><em class=\"medium-importance ng-scope ng-binding\" ng-repeat=\"receiver in mail.to\">\n\t\tFREDERIC D'AMICO<!-- ngIf: $index !== mail.to.length - 1 && receiver.displayName -->\n\t</em>\n\t<br><span class=\"medium-importance\" translate=\"\" key=\"transfer.cc\"><span class=\"no-style ng-scope\">Copie à : </span></span>\n\t<!-- ngRepeat: receiver in mail.cc -->\n</p><blockquote class=\"ng-scope\"><div><span style=\"background-color: rgb(255, 128, 64);\">jios ejoip ejo HIR ZIO DOPS</span></div><div><span style=\"background-color: rgb(255, 255, 255);\">pçuj iodjksop&nbsp;</span></div><div><span style=\"background-color: rgb(128, 128, 255);\">&nbsp;jiosp dklpm</span></div><div><span style=\"background-color: rgb(255, 255, 255);\">e odj pq</span></div><div></div><div></div></blockquote>",
    toName: null,
    ccName: null,
    fromName: null,
    displayNames: [
        [
            "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
            "Aurélie DROUILLAC"
        ],
        [
            "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
            "FREDERIC D'AMICO"
        ]
    ],
    attachments: [],
    systemFolders: [
        "INBOX"
    ]
}

console.log($scope.mail.body);

});
