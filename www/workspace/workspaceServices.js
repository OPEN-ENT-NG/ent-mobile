angular.module('ent.workspace_service', [])

.service('WorkspaceService', function($http, domainENT){

  this.getFoldersByFilter = function(filter){
    return $http.get(domainENT+"/workspace/folders/list?filter="+parametersUrl(filter));
  }

  this.getDocumentsByFilter = function(filter){
    return $http.get(domainENT+"/workspace/documents?filter="+parametersUrl(filter));
  }

  this.getTrashFilesContent = function(){
    return $http.get(domainENT+"/workspace/documents/Trash?filter=owner&_="+getTimeInMillis());
  }

  this.getTrashFolders = function(){
    return $http.get(domainENT+"/workspace/folders/list?filter=owner&_="+getTimeInMillis());
  }

  this.getTranslation = function(){
    return $http.get(domainENT+"/workspace/i18n");
  }

  var parametersUrl = function(filter){
    var entFilter = filter=="appDocuments" ? "protected":filter;
    return params = entFilter+"&hierarchical=true&_="+getTimeInMillis();
  }

  var getTimeInMillis = function(){
    var d = new Date();
    var n = d.getTime();
    return n;
  }
})

.factory("MimeTypeFactory", function(){

  function getThumbnailByMimeType(mimeType){
    var thumbnail = "doc-texticon-";
    for(var i=0; i< mimeTypesArray.length; i++){
      if(mimeTypesArray[i].mimetypes.indexOf(mimeType)!=-1){
        thumbnail = mimeTypesArray[i].thumbnail;
      }
    }
    return thumbnail;
  }

  function setIcons(doc){
    if(doc.hasOwnProperty('thumbnails')){
      doc.icon_image = "/workspace/document/"+doc._id+"?thumbnail=120x120";
    }
    doc.icon_class = getThumbnailByMimeType(doc.metadata["content-type"]);
    return doc;
  }

  return {
    getThumbnailByMimeType: getThumbnailByMimeType,
    setIcons: setIcons
  };
})

var mimeTypesArray = [{

  "thumbnail": "file-wordicon-",
  // "thumbnail": "img/word.png",
  "mimetypes": [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.ms-word.template.macroEnabled.12"
  ]
},
{
  "thumbnail": "file-excelicon-",
  // "thumbnail": "img/excel.png",
  "mimetypes": [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12"
  ]
},
{
  // "thumbnail": "img/word.png",
  "thumbnail": "file-powerpointicon-",
  "mimetypes": [
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    "application/vnd.ms-powerpoint.template.macroEnabled.12",
    "application/vnd.ms-powerpoint.slideshow.macroEnabled.12"
  ]
},
{
  // "thumbnail": "img/pdf.png",
  "thumbnail": "file-pdficon-",
  "mimetypes": [
    "application/pdf"
  ]
},
{
  "thumbnail": "pictureicon-",
  // "thumbnail": "img/image.png",
  "mimetypes": [
    "image/gif",
    "image/jpeg",
    "image/jpg",
    "image/png"
  ]
},
{
  "thumbnail": "musicicon-",
  // "thumbnail": "img/audio.png",
  "mimetypes": [
    "audio/mpeg",
    "audio/x-ms-wma",
    "audio/vnd.rn-realaudio",
    "audio/x-wav",
    "audio/mp3"
  ]
}
]
