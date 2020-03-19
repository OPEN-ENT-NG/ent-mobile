angular
  .module("ent.support", ["ionic", "ent.support_service"])
  .controller("SupportCtrl", function(
    $scope,
    $rootScope,
    $ionicPlatform,
    $ionicLoading,
    $state,
    SupportService,
    PopupFactory,
    UserFactory,
    WorkspaceService
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.beforeEnter", function() {
        delete $scope.ticket;

        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });

        let applicationsPromise = getAllApps().then(apps => {
          $scope.apps = sort(apps, "displayName");
          $scope.schools = sort($rootScope.myUser.schools, "name");

          $scope.ticket = {
            category: $scope.apps[0].address,
            school_id: $scope.schools[0].id,
            subject: "",
            description: "",
            attachments: []
          };
        });

        let translationPromise = SupportService.getTranslation().then(function(
          translation
        ) {
          $scope.translation = translation.data;
        });

        Promise.all([applicationsPromise, translationPromise]).finally(
          $ionicLoading.hide
        );
      });
    });

    $scope.getTranslation = function(app) {
      return (
        (!!$scope.translation && $scope.translation[app.displayName]) ||
        app.name
      );
    };

    $scope.addAttachment = function(ele) {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"/>'
      });
      var attachment = ele.files[0];

      var formData = new FormData();
      formData.append("file", attachment);

      WorkspaceService.uploadAttachment(formData)
        .then(({ data }) => {
          $scope.ticket.attachments.push({
            name: data.metadata.filename,
            size: data.metadata.size,
            id: data._id
          });
        })
        .catch(() =>
          PopupFactory.getAlertPopupNoTitle(
            "Echec dans l'ajout de la piece jointe"
          )
        )
        .finally($ionicLoading.hide);
    };

    $scope.deleteAttachment = function(attachmentId) {
      const newAttachments = $scope.ticket.attachments.filter(
        att => att.id != attachmentId
      );
      $scope.ticket.attachments = newAttachments;
    };

    $scope.saveTicket = function() {
      let error = checkTicket($scope.ticket);
      if (error) {
        PopupFactory.getAlertPopup(
          "Erreur dans le formulaire",
          $scope.translation[error]
        );
      } else {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"/>'
        });
        var subject =
          `${ionic.Platform.platform()} ${ionic.Platform.version()} / App v${
            $rootScope.version
          } / ` + $scope.ticket.subject;

        var category = `mobile;${$scope.ticket.category}`;

        SupportService.createTicket(
          spreadObject($scope.ticket, {
            category: category,
            subject: subject
          })
        ).then(
          res => {
            $ionicLoading.hide();
            PopupFactory.getAlertPopupNoTitle(
              `Demande N°${res.data.id} créée avec succès. Retrouvez le suivi sur la version web du module Aide et support.`
            ).then(() => {
              $state.go("app.timeline_list");
            });
          },
          () => {
            $ionicLoading.hide();
            PopupFactory.getAlertPopup(
              "Echec",
              "La création de la demande a échoué."
            );
          }
        );
      }
    };

    function getAllApps() {
      var filterModules = appList => {
        var appModules = [
          "timeline",
          "support",
          "workspace",
          "conversation",
          "actualites",
          "blog",
          "pronote",
          "lvs"
        ];

        return appList.filter(app =>
          appModules.some(appMod => {
            if (appMod == "pronote" || appMod == "lvs") {
              return !!app.type && app.type.toLowerCase() == appMod;
            } else if (app.prefix) {
              return app.prefix.toLowerCase() === "/" + appMod.toLowerCase();
            }
          })
        );
      };

      return UserFactory.getApplicationsList()
        .then(userApps => {
          let apps = filterModules(
            userApps.filter(function(app) {
              return (
                app.address &&
                app.name &&
                app.address.length > 0 &&
                app.name.length > 0
              );
            })
          );

          apps.push({
            address: "support.category.other",
            displayName: "support.category.other"
          });
          return apps;
        })
        .catch(err => {
          console.log(err);
          return [];
        });
    }

    function sort(collection, key) {
      return collection.sort(function(a, b) {
        let valA = a[key];
        let valB = b[key];
        return valB < valA ? 1 : valB > valA ? -1 : 0;
      });
    }

    function checkTicket(ticket) {
      let result;
      if (!ticket.subject) {
        result = "support.ticket.validation.error.subject.is.empty";
      } else if (ticket.subject.length > 255) {
        result = "support.ticket.validation.error.subject.too.long";
      } else if (!ticket.description) {
        result = "support.ticket.validation.error.description.is.empty";
      } else {
        result = false;
      }
      return result;
    }
  });
