
angular.module('ent.message_folder', [])

.controller('InboxCtrl',  function($scope, $http, $state, $stateParams){

  var url = "";
  var regularFolders = ["INBOX", "OUTBOX", "TRASH", "DRAFT"];
  if(regularFolders.indexOf($stateParams.nameFolder)>-1){
    url="https://recette-leo.entcore.org/conversation/list/"+$stateParams.nameFolder;
    $scope.nameFolder = $stateParams.nameFolder;
  } else {
    url="https://recette-leo.entcore.org/conversation/list/"+localStorage.getItem("messagerie_folder_id")+"?restrain=&page=0";
    $scope.nameFolder = localStorage.getItem("messagerie_folder_name");
  }

  // $http.get(url).then(function(resp){
  //   $scope.messages = resp.data;
  // }, function(err){
  //   alert('ERR:'+ err);
  // });

  $scope.messages = [
    {
      id: "427ec14f-35c9-49d6-81cb-5d04b2e0e538",
      to:
      [
        "ae5e8a4e-0784-4fa0-aa76-27d49a23e941"
      ],
      from: "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
      state: "SENT",
      toName: null,
      fromName: null,
      subject: "RECETTE DE LEO 2",
      date: 1430404331680,
      unread: false,
      displayNames:
      [
        [
          "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
          "Aurélie DROUILLAC"
        ],
        [
          "ae5e8a4e-0784-4fa0-aa76-27d49a23e941",
          "Steven Vergne (Intendance)"
        ],
        [
          "1f8b4a7a-eedc-49d9-a596-3fce35db0573",
          "FREDERIC D'AMICO"
        ]
      ],
      attachments:
      [
        "cfecac29-2afe-4dfb-9400-842760eb8bfc"
      ],
      systemFolders:
      [
        "INBOX"
      ]
    }
  ];

});
