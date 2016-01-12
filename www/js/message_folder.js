
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
      id: "0e5c2b8d-d875-4867-a5bb-668e9790bcae",
      to:[ "5f9c0a3f-3069-4b89-8ef5-31f4a23166eb"],
      date: 1438161867061,
      from: "91d042ed-b4d5-4dc8-bd97-fb0360c01f2b",
      state: "SENT",
      toName: null,
      fromName: null,
      subject: "coucou tlm",
      unread: false,
      displayNames:
      [
        [
          "5f9c0a3f-3069-4b89-8ef5-31f4a23166eb",
          "Test Loic"
        ],
        [
          "91d042ed-b4d5-4dc8-bd97-fb0360c01f2b",
          "VINCENT CAILLET"
        ]
      ],
      attachments: [
        "b166bf6b-0f12-45df-b1ea-803273202e73",
        "0376018f-8f72-4399-8c14-526f56d1cdb6" ],
      systemFolders:
      [
        "INBOX"
      ]
    }
  ];

});
