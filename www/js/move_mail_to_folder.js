angular.module('ent.move_message',['ent.message_services'])

.controller('PopupCtrl',function($scope, $ionicPopup, MessagerieServices) {

  // Triggered on a button click, or some other target
  $scope.showPopup = function() {
    MessagerieServices.getCustomFolders().then(function (resp) {
      $scope.folders = resp.data;
      console.log($scope.folders);
    }, function(err){
      alert('ERR:'+ err);
    });

//     <input type="radio"  ng-model="user.answer" ng-value="'option a'" ><label>option a</label><br>
//  <input type="radio"  ng-model="user.answer" ng-value="'option b'" ><label>option b</label><br>
//    <input type="radio"  ng-model="user.answer" ng-value="'option c'" ><label>option c</label><br>
//      <input type="radio"  ng-model="user.answer" ng-value="'option d'" ><label>option d</label><br>
// <button ng-disabled="!user.answer" ng-click="submitAnswer(user)">Submit</button>

    // An elaborate, custom popup
    $ionicPopup.show({
      template: '<ion-radio ng-repeat="folder in folders" ngModel="choice" ngValue="{{folder}}">{{folder.name}}"</ion-radio>',
      title: 'Déplacement de messages',
      subTitle: 'Choix du dossier',
      scope: $scope,
      buttons: [
        { text: 'Cancel',type: 'button-default',
        onTap: function(e) {
          // e.preventDefault() will stop the popup from closing when tapped.
          e.preventDefault();
        }
       },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            console.log($parent.choice);
            if (!$parent.choice) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              console.log($parent.choice);
              return $parent.choice;
            }
          }
        }
      ]
    })
  }
})

.directive('ionRadio', function() {
  return {
    restrict: 'E',
    replace: true,
    require: '?ngModel',
    scope: {
      ngModel: '=?',
      ngValue: '=?',// WRONG
      ngValue: '@',// CORRECT
      ngChange: '&',
      icon: '@',
      name: '@'
    },
    transclude: true,
    template: '<label class="item item-radio">' +
                '<input type="radio" name="radio-group" ng-model="ngModel" ng-value="ngValue" ng-change="ngChange()">'+
                '<div class="item-content disable-pointer-events" ng-transclude></div>' +
                '<i class="radio-icon disable-pointer-events icon ion-checkmark"></i>' +
              '</label>',

    compile: function(element, attr) {
      if(attr.name) element.children().eq(0).attr('name', attr.name);
      if(attr.icon) element.children().eq(2).removeClass('ion-checkmark').addClass(attr.icon);
    }
  };
});
