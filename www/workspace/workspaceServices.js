angular.module('ent.workspace_service', [])

.service('WorkspaceService', function($http, domainENT){

  var configHeaders = {
    headers: { 'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8" }
  };

  this.getFoldersByFilter = function(filter, hierarchical){
    return $http.get(domainENT+"/workspace/folders/list?filter="+parametersUrl(filter,hierarchical))
  }

  this.getDocumentsByFilter = function(filter,hierarchical){

    console.log($http.get(domainENT+"/workspace/documents?filter="+parametersUrl(filter,hierarchical)));
    return $http.get(domainENT+"/workspace/documents?filter="+parametersUrl(filter,hierarchical))
  }
  this.getCompleteDocumentsByFilter = function(filter,hierarchical){
    return $http.get(domainENT+"/workspace/documents?filter="+parametersUrl(filter,hierarchical))
  }

  this.getDocumentsByFolderAndFilter = function(folderName,filter){
    return $http.get(domainENT+'/workspace/documents/'+folderName+'?filter='+filter+'&hierarchical=true&_='+getTimeInMillis())
  }

  this.getTrashFilesContent = function(){
    return $http.get(domainENT+"/workspace/documents/Trash?filter=owner&_="+getTimeInMillis())
  }

  this.getCompleteFoldersByFilter = function(filter) {
    return $http.get(domainENT+'/workspace/folders/list?filter=' + filter + '&_='+getTimeInMillis())
  }

  this.commentDocById = function (id, comment){
    return $http.post(domainENT+'/workspace/document/'+id+'/comment', "comment="+ comment, configHeaders)
  }

  this.renameDoc = function (id, newName){
    var data = {
      name: newName
    }
    return $http.put(domainENT+'/workspace/document/'+id, data)
  }

  this.getTranslation = function(){
    return $http.get(domainENT+"/workspace/i18n");
  }

  var parametersUrl = function(filter, hierarchical){
    var entFilter = filter=="appDocuments" ? "protected":filter;
    return params = hierarchical ? entFilter+'&hierarchical=true&_='+getTimeInMillis():entFilter+'&_='+getTimeInMillis();
  }

  var getTimeInMillis = function(){
    var d = new Date();
    var n = d.getTime();
    return n;
  }
})

.factory("MimeTypeFactory", function(){

  function getThumbnailByMimeType(mimeType){
    var thumbnail = "unknown-large.png";
    for(var i=0; i< mimeTypesArray.length; i++){
      if(mimeTypesArray[i].mimetypes.indexOf(mimeType)!=-1){
        thumbnail = mimeTypesArray[i].thumbnail;
      }
    }
    return thumbnail;
  }

  function setIcons(doc){
    if(doc.hasOwnProperty('thumbnails')){
      var dimensions='';
      switch (Object.keys(doc.thumbnails).length) {
        case 1:
        dimensions="120x120"
        break;
        case 2:
        dimensions="290x290"
        break;
        default:
        break;
      }
      doc.icon_image = "/workspace/document/"+doc._id+"?thumbnail="+dimensions;
    } else {
      doc.icon_image = localStorage.getItem('skin')+"/../../img/icons/"+getThumbnailByMimeType(doc.metadata["content-type"]);
    }
    return doc;
  }

  return {
    getThumbnailByMimeType: getThumbnailByMimeType,
    setIcons: setIcons
  };
})

var mimeTypesArray = [{

  "thumbnail": "doc-large.png",
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
  "thumbnail": "xls-large.png",
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
  "thumbnail": "pdf-large.png",
  "mimetypes": [
    "application/pdf"
  ]
},
{
  "thumbnail": "audio-large.png",
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
