angular
  .module("ent")
  .value("domainENT", "https://ent.parisclassenumerique.fr")
  //.value("domainENT", "https://preprod-paris.opendigitaleducation.com")
  //.value("domainENT", "https://ng3.preprod-ent.fr")
  .value("OAuth2Params", {
    clientId: "Application Mobile" /* champ identifiant */,
    secret: "mdpconnecteursecret" /* champ code secret */,
    scope:
      "userbook userinfo directory workspace conversation document blog actualites avatar timeline cas portal support" /* champ scope */
  });
