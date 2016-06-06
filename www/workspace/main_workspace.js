angular.module('ent.workspace',['ent.workspace_service','ent.workspace_content', 'ent.workspace_trash','ent.workspace_folder_depth', 'ent.workspace_file', 'ent.workspace_move_file'])

.controller('MainWorkspaceCtrl', function(){
})

function getCheckedItems(arrayFolders, arrayDocs){
  return {
    folders: getCheckedFolders(arrayFolders),
    documents: getCheckedDocuments(arrayDocs)
  }
}

function getCheckedFolders(arrayFolders){
  var checkedFolders =[]
  for(var i=0; i<arrayFolders.length; i++){
    if(arrayFolders[i].checked){
      checkedFolders.push(arrayFolders[i])
    }
  }
  return checkedFolders
}

function getCheckedDocuments(arrayDocs){
  var checkedDocuments =[]
  for(var i=0; i<arrayDocs.length; i++){
    if(arrayDocs[i].checked){
      checkedDocuments.push(arrayDocs[i])
    }
  }
  return checkedDocuments
}

function setUnchecked (array){
  for(var i=0; i<array.length; i++){
    if(array[i].checked){
      array[i].checked = false
    }
  }
  return array
}

function getFilter(nameWorkspaceFolder){
  var filter ="";
  switch(nameWorkspaceFolder){
    case "documents":
      filter="owner";
      break;
      case "trash":
        filter="owner";
        break;
        default:
          filter = nameWorkspaceFolder;
          break;
        }

        return filter;
      }
