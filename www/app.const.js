angular.module('ent')
 .value("domainENT", "https://ent.parisclassenumerique.fr")
//  .value("domainENT", "https://preprod-leo.entcore.org")
// .value("domainENT", "https://preprod-paris.opendigitaleducation.com")
//  .value("domainENT", "http://ent4-core.gdapublic.fr")
//  .value("domainENT", "https://cgi-u-dev.fr")
//   .value("domainENT", "http://ent3-core.gdapublic.fr")
  .value("OAuth2Params", {
    clientId : "Application Mobile", /* champ identifiant */
    // secret : "secret", /* champ code secret */
    secret : "mdpconnecteursecret", /* champ code secret */
    scope : "userbook userinfo directory workspace conversation document blog actualites avatar timeline cas portal" /* champ scope */
    // scope : "userbook userinfo directory workspace conversation document blog actualites avatar timeline" /* champ scope */
  });
