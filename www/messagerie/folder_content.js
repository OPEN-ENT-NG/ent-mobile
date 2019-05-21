angular
  .module("ent.message_folder", ["ent.message_services"])

  .controller("InboxCtrl", function(
    $scope,
    $state,
    $stateParams,
    $rootScope,
    domainENT,
    MessagerieServices,
    $ionicLoading,
    $cordovaVibration,
    $ionicHistory,
    $ionicPopover,
    $ionicScrollDelegate,
    MoveMessagesPopupFactory,
    DeleteMessagesPopupFactory,
    $ionicListDelegate
  ) {
    $rootScope.nameFolder = $stateParams.nameFolder;
    console.log($stateParams.nameFolder);
    getMessagesAndFolders();

    $rootScope.getRealName = function(id, displayNames) {
      var returnName = "Inconnu";
      for (var i = 0; i < displayNames.length; i++) {
        if (id == displayNames[i][0]) {
          returnName = displayNames[i][1];
        }
      }
      return returnName;
    };

    $ionicPopover
      .fromTemplateUrl("messagerie/popover_messagerie_folder.html", {
        scope: $scope
      })
      .then(function(popover) {
        $rootScope.popover = popover;
      });

    $scope.restoreMessages = function() {
      MessagerieServices.restoreSelectedMessages(getSelectedMessages()).then(
        function() {
          getMessagesAndFolders();
        },
        function() {
          $ionicLoading.hide();
        }
      );
    };

    $scope.canShowRestore = function() {
      return $stateParams.nameFolder == "trash" && $scope.checkable;
    };

    $scope.showPopupMove = function() {
      var popupMove = MoveMessagesPopupFactory.getPopup($scope);
      popupMove.then(function(res) {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        console.log(res);
        if (res != null) {
          MessagerieServices.moveMessages(getSelectedMessages(), res).then(
            function() {
              getMessagesAndFolders();
            }
          );
        }
        $ionicLoading.hide();
      });
    };

    $rootScope.newMail = function() {
      $state.go("app.new_message");
    };

    $scope.enableCheckMessages = function(index) {
      if (!$scope.checkable) {
        $cordovaVibration.vibrate(100); // Vibrate 100ms
        $scope.checkable = true;
        $scope.checkMessage(index);
      }
    };

    $scope.deleteMessage = function(mail) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.deleteSelectedMessages(
        [mail],
        $rootScope.nameFolder
      ).then(
        function() {
          $ionicHistory.clearCache();
          $ionicListDelegate.closeOptionButtons();
          updateMessages();
          $ionicLoading.hide();
        },
        function() {
          $ionicLoading.hide();
        }
      );
    };

    $scope.deleteSelectedMessages = function() {
      var messagesList = getSelectedMessages();
      if (messagesList.length > 0) {
        DeleteMessagesPopupFactory.getPopup().then(function(res) {
          if (res) {
            MessagerieServices.deleteSelectedMessages(
              messagesList,
              $stateParams.nameFolder
            ).then(function() {
              getMessagesAndFolders();
            });
          }
        });
      }
    };

    $scope.checkMessage = function(index) {
      $scope.messages[index].checked = !$scope.messages[index].checked;
    };
    console.log($scope.messages);

    $scope.doAction = function(index) {
      $scope.checkable ? $scope.checkMessage(index) : goToMessage(index);
    };

    $rootScope.getCountOfCheckedMessages = function() {
      return getSelectedMessages().length;
    };

    function getSelectedMessages() {
      var array = [];
      angular.forEach($scope.messages, function(message) {
        if (message.checked) {
          array.push(message);
        }
      });
      return array;
    }

    $scope.showNumberOfCheckedMessages = function() {
      return $scope.checkable
        ? $stateParams.nameFolder
        : getCountOfCheckedMessages();
    };

    $rootScope.$ionicGoBack = function() {
      if ($scope.checkable) {
        $scope.checkable = false;
        initCheckedValue();
      } else {
        $ionicHistory.goBack();
      }
    };

    // var doCustomBack= function() {
    //   if($scope.checkable){
    //     $scope.checkable = false;
    //     initCheckedValue();
    //     $scope.$apply();
    //   } else {
    //     $ionicHistory.goBack();
    //   }
    // };

    // var deregisterHardBack= $ionicPlatform.registerBackButtonAction(doCustomBack, 1001);
    // $scope.$on('$destroy', function() {
    //   deregisterHardBack();
    // });

    $scope.doRefreshMessages = function() {
      $scope.messages.unshift(updateMessages());
      $scope.extraFolders.unshift(getExtraFolders());
      $scope.$broadcast("scroll.refreshComplete");
      $scope.$apply();
      $ionicScrollDelegate.resize();
    };

    function getMessagesAndFolders() {
      $scope.nameFolder = $stateParams.nameFolder;
      updateMessages();
      getExtraFolders();
    }

    function updateMessages() {
      $scope.checkable = false;
      getMessages(getUrlFolder());
    }

    function getUrlFolder() {
      var regularFolders = ["INBOX", "OUTBOX", "TRASH", "DRAFT"];
      var url = domainENT + "/conversation/list/" + $stateParams.idFolder;
      if (regularFolders.indexOf($stateParams.idFolder) == -1) {
        url += "?restrain=&page=0";
      }
      console.log(url);
      return url;
    }

    function getMessages(url) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      MessagerieServices.getMessagesFolder(url).then(
        function(response) {
          $scope.messages = response.data;
          initCheckedValue();
        },
        function() {
          $ionicLoading.hide();
        }
      );
    }

    function getExtraFolders() {
      MessagerieServices.getExtraFolders($stateParams.idFolder)
        .then(function(resp) {
          console.log(resp.data);
          $scope.extraFolders = [];
          for (var i = 0; i < resp.data.length; i++) {
            $scope.extraFolders.push({
              id: resp.data[i].id,
              name: resp.data[i].name,
              isPersonnal: true
            });
          }
        })
        .then(
          function() {
            var folderIds = [];
            angular.forEach($scope.extraFolders, function(extraFolder) {
              folderIds.push(extraFolder.id);
            });
            MessagerieServices.getCountUnread(folderIds).then(function(
              response
            ) {
              console.log(folderIds);
              console.log(response);
              for (var i = 0; i < response.length; i++) {
                console.log($scope.extraFolders[i]);
                console.log(response[i].count);

                $scope.extraFolders[i].count = response[i].count;
              }
              $ionicLoading.hide();
            });
          },
          function() {
            $ionicLoading.hide();
          }
        );
    }

    function initCheckedValue() {
      angular.forEach($scope.messages, function(message) {
        message.checked = false;
      });
      console.log($scope.messages);
    }

    function goToMessage(index) {
      $state.go("app.message_detail", {
        nameFolder: $stateParams.nameFolder,
        idMessage: $scope.messages[index].id
      });
    }
  });
