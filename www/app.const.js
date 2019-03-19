angular
  .module("ent")
  .value("domainENT", "%PLATFORM_ADDRESS%")
  .value("OAuth2Params", {
    clientId: "%CONNECTOR_ID%" /* champ identifiant */,
    secret: "%CONNECTOR_SECRET%" /* champ code secret */,
    scope: "%CONNECTOR_SCOPE%" /* champ scope */
  })
  .value("xitiIndex", {
    actualites: { index: 6, label: "Application Mobile - Actualités" },
    messagerie: { index: 13, label: "Application Mobile - Messagerie" },
    support: { index: 15, label: "Application Mobile - Blog" },
    workspace: { index: 16, label: "Application Mobile - Espace Documentaire" },
    login: { index: 19, label: "Application Mobile - Login" }
  });
