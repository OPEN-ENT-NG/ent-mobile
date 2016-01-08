
angular.module('ent.inbox', [])

.controller('InboxCtrl', function($scope, $http, $state){

  // $http.get("https://recette-leo.entcore.org/conversation/list/INBOX").then(function(resp){
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
      attachments: [ ],
      systemFolders:
      [
        "INBOX"
      ]
    }
  ];

  $scope.getRealName =function(message){
    var returnName = "Inconnu";
    var from = message.from;
    for(var i = 0; i< message.displayNames.length; i++){
      if(from === message.displayNames[i][0] && returnName === "Inconnu"){
        returnName = message.displayNames[i][1];
      }
    }
    return returnName;
  }

});

// function getRealName (message){
//   var returnName = "Inconnu";
//   var from = message.from;
//   for(var i = 0; i< message.displayNames.length; i++){
//     if(from === message.displayNames[i][0] && returnName === "Inconnu"){
//       returnName = message.displayNames[i][1];
//     }
//   }
//   alert(returnName);
//   return returnName;
// }
