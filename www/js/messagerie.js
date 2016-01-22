angular.module('ent.messagerie', [])

.controller('MessagerieFoldersCtrl', function($scope, $http, $state, $rootScope){
  $http.get("https://recette-leo.entcore.org/conversation/folders/list").then(function(resp){
    $scope.folders = resp.data;
  }, function(err){
    alert('ERR:'+ err);
  });

  $rootScope.contacts = [];
  // $http.get("https://recette-leo.entcore.org/conversation/visible").then(function(resp){
  //
  //   for(var i = 0; i< resp.data.groups.length; i++){
  //     $rootScope.contacts.push({
  //       _id:  resp.data.groups[i].id,
  //       displayName:  resp.data.groups[i].name,
  //       groupDisplayName:  resp.data.groups[i].groupDisplayName,
  //       profile:  resp.data.groups[i].status
  //     });
  //   }
  //   for(var i = 0; i<  $rootScope.otherContacts.users.length; i++){
  //     $rootScope.contacts.push({
  //       _id:  resp.data.users[i].id,
  //       displayName:  resp.data.users[i].displayName,
  //       groupDisplayName:  resp.data.users[i].groupDisplayName,
  //       profile:  resp.data.users[i].status
  //     });
  //   };
  // }, function(err){
  //   alert('ERR:'+ err);
  // });


  $scope.setCurrentFolder = function (index){
    localStorage.setItem('messagerie_folder_name',$scope.folders[index].name);
    localStorage.setItem('messagerie_folder_id',$scope.folders[index].id);
  }

  $scope.newMail = function(){
    $state.go("app.new_message");
  }

  $scope.doRefreshFolders = function() {

    $http.get("https://recette-leo.entcore.org/conversation/folders/list").then(function(resp){
      $scope.folders = resp.data;
    }, function(err){
      alert('ERR:'+ err);
    })
    .finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  // $scope.folders=
  // [
  //   {
  //     name: "cocorico",
  //     id: "21f7dab9-973a-49c1-bb60-2c8b870aadbc"
  //   },
  //   {
  //     name: "# TRAVAIL ]",
  //     id: "34d19db0-f83e-47e7-aae8-1be863247a8e"
  //   },
  //   {
  //     name: "& PERSO &",
  //     id: "ec8124e7-6ab5-4569-abfe-a05b7de3568b"
  //   }
  // ];


  $rootScope.otherContacts =
  {

    groups:[
      {
        id: "73825-1452590663199",
        name: "Tous les gestionnnaires de la communauté a.",
        groupDisplayName: null,
        profile: null

      },
      {

        id: "73786-1452526764539",
        name: "Tous les gestionnnaires de la communauté test-forum.",
        groupDisplayName: null,
        profile: null

      },
      {

        id: "25371-1452097565207",
        name: "Tous les gestionnnaires de la communauté Test 4855.",
        groupDisplayName: null,
        profile: null
      }
    ],
    users: [
      {

        id: "8ba1eaac-28f0-41e4-b38f-d20ce4d9a2ba",
        displayName: "Aurélie DROUILLAC",
        groupDisplayName: null,
        profile: "Teacher"

      },
      {

        id: "91d042ed-b4d5-4dc8-bd97-fb0360c01f2b",
        displayName: "VINCENT CAILLET",
        groupDisplayName: null,
        profile: "Teacher"

      },
      {

        id: "19fee7e7-c10a-4730-a987-71931aab7199",
        displayName: "Andréa Ross",
        groupDisplayName: null,
        profile: "Student"

      }
    ]
  };

  $rootScope.transform = function(){
    for(var i = 0; i< $rootScope.otherContacts.groups.length; i++){
      $rootScope.contacts.push({
        _id:  $rootScope.otherContacts.groups[i].id,
        displayName:  $rootScope.otherContacts.groups[i].name,
        groupDisplayName:  $rootScope.otherContacts.groups[i].groupDisplayName,
        profile:  $rootScope.otherContacts.groups[i].profile
      });
    }
    for(var i = 0; i<  $rootScope.otherContacts.users.length; i++){
      $rootScope.contacts.push({
        _id:  $rootScope.otherContacts.users[i].id,
        displayName:  $rootScope.otherContacts.users[i].displayName,
        groupDisplayName:  $rootScope.otherContacts.users[i].groupDisplayName,
        profile:  $rootScope.otherContacts.users[i].profile
      });
    };
  
  }


})
