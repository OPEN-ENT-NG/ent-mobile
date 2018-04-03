angular.module('ent')
// .value("domainENT", "https://ent.picardie.fr")
//  .value("domainENT", "https://preprod-leo.entcore.org")
 .value("domainENT", "https://preprod-paris.opendigitaleducation.com")
// .value("domainENT", "http://10.83.199.153:8090")
// .value("domainENT", "http://ent4-core.gdapublic.fr")
  // .value("domainENT", "http://10.83.199.37:8090")
//   .value("domainENT", "https://ent-core.gdapublic.fr")
//   .value("domainENT", "http://localhost:8090")
  .value("OAuth2Params", {
    clientId : "Application Mobile", /* champ identifiant */
    secret : "secret" /* champ code secret */
  });
