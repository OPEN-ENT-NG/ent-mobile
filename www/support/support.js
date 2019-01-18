/* 			return app.address && app.name && app.address.length > 0 && app.name.length > 0;
 */
angular
  .module("ent.support", ["ionic", "ent.support_service"])
  .controller("SupportCtrl", function(
    $scope,
    $rootScope,
    $ionicPlatform,
    $ionicLoading,
    $state,
    SupportService
  ) {
    $ionicPlatform.ready(function() {
      $scope.$on("$ionicView.enter", function() {
        delete $scope.ticket;
        SupportService.getAllApps().then(function(applications) {
          let apps = SupportService.filterModules(
            applications.data.apps.filter(function(app) {
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
          $scope.apps = sort(apps, "displayName");
          $scope.schools = sort($rootScope.myUser.schools, "name");

          $scope.ticket = {
            category: $scope.apps[0].address,
            school_id: $scope.schools[0].id,
            subject: "",
            description: ""
          };
        });

        SupportService.getTranslation().then(function(translation) {
          $scope.translation = translation.data;
        });
      });

      $scope.getTranslation = function(app) {
        return $scope.translation[app.displayName] || app.name;
      };

      $scope.addAttachment = function() {
        $scope.getAlertPopup(
          "Non disponible",
          "Cette fonctionnalité n'est pas encore disponible."
        );
      };

      $scope.saveTicket = function() {
        let error = checkTicket($scope.ticket);
        if (error) {
          $scope.getAlertPopup(
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

          SupportService.createTicket({
            ...$scope.ticket,
            category: category,
            subject: subject
          }).then(
            () => {
              $ionicLoading.hide();
              $scope
                .getAlertPopup("Succès", "Demande créée avec succès.")
                .then(() => {
                  $state.go("app.timeline.list");
                });
            },
            () => {
              $ionicLoading.hide();
              $scope.getAlertPopup(
                "Echec",
                "La création de la demande a échoué."
              );
            }
          );
        }
      };

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
  });
