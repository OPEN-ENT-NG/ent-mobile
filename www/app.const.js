angular
  .module("ent")
  .value("domainENT", "%PLATFORM_ADDRESS%")
  //.value("domainENT", "https://preprod-paris.opendigitaleducation.com")
  //.value("domainENT", "https://ng3.preprod-ent.fr")
  .value("OAuth2Params", {
    clientId: "%CONNECTOR_ID%" /* champ identifiant */,
    secret: "%CONNECTOR_SECRET%" /* champ code secret */,
    scope: "%CONNECTOR_SCOPE%" /* champ scope */
  });
