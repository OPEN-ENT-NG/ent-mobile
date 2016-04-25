angular.module("ent.test", ['textAngular'])


.controller('TestCtrl', function($scope){

  $scope.orightml = '<h2>Try me!</h2><p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li style="color: green;">Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li class="text-danger">Doesn&apos;t Use an iFrame</li><li>Works with Firefox, Chrome, and IE8+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p>';

  $scope.htmlcontent = $scope.orightml;
  $scope.disabled = false;


})

.controller('WebCtrl', function($scope, domainENT){
  console.log("in web ctrl");
  $scope.getUrl = function (){
    console.log(domainENT+"userbook/mon-compte.html");
    return domainENT+"userbook/mon-compte.html";
  }
})

.controller('InputFileCtrl', function($scope, domainENT){

  $scope.files = [];
  $scope.fileNameChanged = function(ele){
    files = ele.files;
    namesArr = [];
    for(var i =0; i<files.length; i++){
      console.log(files[i].name);
      $scope.files.push(files[i])
      console.log( $scope.files);
    }
  }
})
