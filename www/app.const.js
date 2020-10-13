angular
  .module("ent")
  .value("domainENT", "https://ent.parisclassenumerique.fr")
  .value("OAuth2Params", {
    clientId: "Application Mobile" /* champ identifiant */,
    secret: "mdpconnecteursecret" /* champ code secret */,
    scope: "userbook userinfo directory workspace conversation document blog actualites avatar timeline cas portal support xiti sso" /* champ scope */
  })
  .value("xitiIndex", {
    actualites: { index: 6, label: "Application Mobile - Actualités" },
    messagerie: { index: 13, label: "Application Mobile - Messagerie" },
    support: { index: 15, label: "Application Mobile - Blog" },
    workspace: { index: 16, label: "Application Mobile - Espace Documentaire" },
    login: { index: 19, label: "Application Mobile - Login" }
  });
