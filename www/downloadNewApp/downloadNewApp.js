angular
  .module("ent.downloadNewApp", [])

  .controller("DownloadNewApp", function ($scope) {
    $scope.goToDownloadAddress = function () {
      cordova.InAppBrowser.open(
        "https://www.parisclassenumerique.fr/lutece/jsp/site/Portal.jsp?document_id=415&portlet_id=98",
        "_system"
      );
    };
  });
