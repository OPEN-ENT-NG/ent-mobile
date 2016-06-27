var actionsName = {
  "read" : 1,
  "contrib" : 2,
  "comment" : 3,
  "manager" : 0
}

angular.module('ent.share_item',['ent.workspace_service','ent.message_services'])

.controller('ShareItemController', function($scope, $rootScope, $stateParams, $state,$ionicPosition, $ionicScrollDelegate, WorkspaceService, MessagerieServices, $ionicLoading){
  $scope.contactShared = [];
  $scope.showContactSolo = true ;
  $scope.showContactGroup = true ;
  $scope.hasFilters = true ;
  var idItems = $stateParams.idItems;
  var allActions = [];
  var isGettedContacts = false ;
  var isGettedSharings = false ;

  complementHeaderList();
  getContacts();

  function getContacts () {
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    $scope.contacts = [];
    MessagerieServices.getContactsService().then(function(resp){
      for(var i = 0; i< resp.data.groups.length; i++){
        $scope.contacts.push({
          _id:  resp.data.groups[i].id,
          displayName:  resp.data.groups[i].name,
          profile:  "Groupe"
        });
      }
      for(var i = 0; i<  resp.data.users.length; i++){
        if(resp.data.users[i].id != $rootScope.myUser.id){
          $scope.contacts.push({
            _id:  resp.data.users[i].id,
            displayName:  resp.data.users[i].displayName,
            profile:  resp.data.users[i].profile
          });
        }
      };
      getSharingItemDatas();
    }, function(err){
        $scope.showAlertError();
    })
  }

  function getSharingItemDatas(){
    $scope.contactShared = [];
    WorkspaceService.getSharingItemDatas(idItems).then(function(resp){
      var data = resp.data ;
      allActions = data.actions;
      if(data.groups.checked.length!=0){
        for(var i = 0 ; i < data.groups.visibles.length ; i++ ){
          var actions = data.groups.checked[data.groups.visibles[i].id];
          if(actions){
            addContactShared(data.groups.visibles[i],actions,true);
          }
        }
      }
      if(data.users.checked.length!=0){
        for(var i = 0 ; i < data.users.visibles.length ; i++ ){
          var actions = data.users.checked[data.users.visibles[i].id];
          if(actions){
            console.log(actions);
            addContactShared(data.users.visibles[i],actions,false);
          }
        }
      }
      complementHeaderList();
      $ionicLoading.hide();
    },function(err){
      console.log(err);
    })
  }

  function updateSharingItemDatas(idItem, sharingDatas, isRemove){
    $ionicLoading.show({
      template: '<ion-spinner icon="android"/>'
    });
    WorkspaceService.updateSharingActions(idItem, sharingDatas, isRemove).then(function(resp){
      console.log('success');
      console.log(resp);
      $ionicLoading.hide();
    },function(err){
      $scope.showAlertError(err);
      $ionicLoading.hide();
    });
  }

  function removeContactSharedFromGroupOrUser(id){
    var index = -1 ;
    for(var i = 0 ; i < $scope.contacts.length ; i++){
      if(id == $scope.contacts[i]._id){
        index = i;
        break;
      }
    }
    $scope.contacts.splice(index,1);
  }

  function addContactShared(dataContact, actions,isGroup){
    var contactShared = {} ;
    var rights = actionsToRights(actions);

    removeContactSharedFromGroupOrUser(dataContact.id);

    contactShared.id = dataContact.id;
    if(!isGroup){
      contactShared.name = dataContact.username ;
      contactShared.profile = dataContact.profile ;
    }else{
      contactShared.name = dataContact.name ;
      contactShared.profile = "Groupe" ;
    }
    contactShared.read = getChecked($rootScope.translationWorkspace['workspace.read'],rights);
    contactShared.contrib = getChecked($rootScope.translationWorkspace['workspace.contrib'],rights);
    contactShared.comment = getChecked($rootScope.translationWorkspace['workspace.comment'],rights);
    contactShared.manager = getChecked($rootScope.translationWorkspace['workspace.manager'],rights);
    contactShared.isSharingOpen = false ;
    contactShared.isGroup = isGroup ;
    $scope.contactShared.push(contactShared);
  }

  function rightsToActions(read,contrib,manager,comment){
    var newsActions = [];
    var actionsToDelete = [];
    var removeSharing = false ;
    if(read){
      console.log("READ");
      newsActions = newsActions.concat(allActions[actionsName['read']].name);
      if(contrib){
        console.log("CONTRIB");
        newsActions = newsActions.concat(allActions[actionsName['contrib']].name);
        if(manager){
          console.log("MANAGER");
          newsActions = newsActions.concat(allActions[actionsName['manager']].name);
        }else{
          actionsToDelete = actionsToDelete.concat(allActions[actionsName['manager']].name);
        }
      }else{
        actionsToDelete = actionsToDelete.concat(allActions[actionsName['contrib']].name);
        actionsToDelete = actionsToDelete.concat(allActions[actionsName['manager']].name);
      }
      if(comment){
        console.log("COMMENT");
        newsActions = newsActions.concat(allActions[actionsName['comment']].name);
      }else{
        actionsToDelete = actionsToDelete.concat(allActions[actionsName['comment']].name);
      }
    }else{
      removeSharing = true ;
    }
    return {
      actionsToDelete: actionsToDelete,
      newsActions: newsActions,
      removeSharing: removeSharing
    } ;
  }

  function actionsToRights(tabActions){
    var rights = [];
    var contrib,comment,read,manager = false ;
    for(var i = 0 ; i < tabActions.length ; i++){
      if(!comment && tabActions[i].indexOf('commentFolder') != -1){
        comment = true ;
      }
      if(!contrib && tabActions[i].indexOf('updateDocument') != -1){
        contrib = true ;
      }
      if(!read && tabActions[i].indexOf('getRevision') != -1){
        read = true ;
      }
      if(!manager && tabActions[i].indexOf('shareJsonSubmit') != -1){
        manager = true ;
      }
    }
    if(read){
      rights.push($rootScope.translationWorkspace["workspace.read"])
      if(contrib){
        rights.push($rootScope.translationWorkspace["workspace.contrib"])
        if(manager){
          rights.push($rootScope.translationWorkspace["workspace.manager"])
        }
      }
      if(comment){
        rights.push($rootScope.translationWorkspace["workspace.comment"])
      }
    }
    return rights;
  }

  function getChecked(type,rights){
    for(var i = 0 ; i < rights.length ; i++){
      if(rights[i]==type){
        return true;
      }
    }
    return false ;
  }

  function complementHeaderList(){
    var headerList = "Partagé avec "+$scope.contactShared.length;
    if($scope.contactShared.length>1){
      headerList = headerList+" personnes";
    }else{
      headerList = headerList+" personne";
    }
    $scope.headerList = headerList ;
  }

  $scope.moveToShare = function(index, contact, isGroup){
      var contactShared = {} ;
      $scope.contacts.splice(index,1);
      contactShared.id = contact._id;
      contactShared.name = contact.displayName ;
      contactShared.profile = contact.profile ;
      contactShared.read = true ;
      contactShared.contrib = false ;
      contactShared.comment = false ;
      contactShared.manager = false ;
      contactShared.isSharingOpen = false ;
      contactShared.isGroup = isGroup ;
      $scope.contactShared.push(contactShared);
      $scope.openSharing(contactShared.id);
      $scope.closeFilters();
  }

  $scope.openSharing = function(contactId){
    for(var i = 0 ; i < $scope.contactShared.length ; i++){
      if($scope.contactShared[i].id == contactId){
        $scope.contactShared[i].isSharingOpen = !$scope.contactShared[i].isSharingOpen;
      }else{
        $scope.contactShared[i].isSharingOpen = false;
      }
    }
  }

  $scope.changeStateChecked = function (type,contactId){
    for(var i = 0 ; $scope.contactShared.length ; i++){
      if(contactShared[i].id == contactId){
        if(type==$rootScope.translationWorkspace['workspace.read']){
          contactShared[i].read = !contactShared[i].read;
        } else if(type==$rootScope.translationWorkspace['workspace.comment']){
          contactShared[i].comment = !contactShared[i].read;
        } else if(type==$rootScope.translationWorkspace['workspace.contrib']){
          contactShared[i].contrib = !contactShared[i].read;
        } else if(type==$rootScope.translationWorkspace['workspace.manager']){
          contactShared[i].manager = !contactShared[i].read;
        }
        break;
      }
    }
  }

  $scope.closeFilters = function(){
      $scope.searchTo = '';
      complementHeaderList();
      document.getElementById("searchId").value = '' ;
  }

  $scope.setFilterText = function(text){
    $scope.searchTo = text;
    if(text.length > 0){
      $scope.headerList = "Contacts" ;
    }else{
      complementHeaderList();
    }
  }

  $scope.modifyCheckValues = function(contactShared, right){
    if(right == 'read'){
      if(!contactShared.read){
        contactShared.contrib = false ;
        contactShared.manager = false ;
        contactShared.comment = false ;
      }
    }else if(right == 'contrib'){
      if(!contactShared.contrib){
        contactShared.manager = false ;
      }else{
        contactShared.read = true ;
      }
    }else if(right == 'manager'){
      if(contactShared.manager){
        contactShared.read = true ;
        contactShared.contrib = true ;
      }
    }else if(right == 'comment'){
      if(contactShared.comment){
        contactShared.read = true ;
      }
    }
  }

  $scope.$on("$ionicView.beforeLeave", function(event, data){
   // handle event
   for(var i = 0 ; i < $scope.contactShared.length ; i++){

     var contactShared = $scope.contactShared[i]
     var actionsDatas = rightsToActions(contactShared.read,contactShared.contrib,contactShared.manager,contactShared.comment);
     var actionsDatasToUpdate = actionsDatas.newsActions;
     var actionsDatasToDelete = actionsDatas.actionsToDelete;
     var removeSharing = actionsDatas.removeSharing;

     if(!removeSharing){

       if(actionsDatasToUpdate){
         var sharingDatasToUpdate = [];
         sharingDatasToUpdate['actions'] = actionsDatasToUpdate ;
         if(contactShared.isGroup){
           sharingDatasToUpdate['groupId'] = $scope.contactShared[i].id;
         }else{
           sharingDatasToUpdate['userId'] = $scope.contactShared[i].id;
         }
         updateSharingItemDatas(data.stateParams.idItems, sharingDatasToUpdate, false);
       }

       if(actionsDatasToDelete){
         var sharingDatasToDelete = [];
         sharingDatasToDelete['actions'] = actionsDatasToDelete ;
         if(contactShared.isGroup){
           sharingDatasToDelete['groupId'] = $scope.contactShared[i].id;
         }else{
           sharingDatasToDelete['userId'] = $scope.contactShared[i].id;
         }
         updateSharingItemDatas(data.stateParams.idItems, sharingDatasToDelete, true);
       }

     } else {
       var sharingDatasToDelete = [];
       sharingDatasToDelete['actions'] = [] ;
       if(contactShared.isGroup){
         sharingDatasToDelete['groupId'] = $scope.contactShared[i].id;
       }else{
         sharingDatasToDelete['userId'] = $scope.contactShared[i].id;
       }
       updateSharingItemDatas(data.stateParams.idItems, sharingDatasToDelete, true);
     }
   }
  });
})
