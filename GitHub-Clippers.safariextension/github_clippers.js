
// Should we run the code here?
var validateWithSettings = function(settings) {
  var repos = settings.repos.replace(/ /g, "").split(",")
  var arrayLength = repos.length
  for (var i = 0; i < arrayLength; i++) {
    var repo = repos[i]
    if (document.location.pathname.startsWith("/" + repo)) {
      return true
    }
  }
  return false
}

// Based on http://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    }
})();

// Look through the DOM to find the pull request merging section on the GitHub page
// find the form that's associated with deleting a PR, then hit it.

var detectAndTapDeleteBranch = function() {
  var mergeSection = document.getElementById("partial-pull-merging")
  if (!mergeSection) { return }
  
  var saysDeleteBranch = mergeSection.textContent.toLowerCase().indexOf("delete branch") != -1

  var forms = mergeSection.getElementsByTagName("form");
  if (saysDeleteBranch && forms.length) {
    var deleteForm = forms[0]
    deleteForm.submit();
  }
}

var start = function() {
  var settings, init = function() {
  
    if (validateWithSettings(settings)) {
      // Keep an eye out for changes WRT deleting branches when you hit the merge button
      observeDOM( document.getElementById('js-repo-pjax-container'), function(){  detectAndTapDeleteBranch() });
      detectAndTapDeleteBranch()
    }
  };

  // listen for an incoming setSettings message
  safari.self.addEventListener( "message", function( e ) {
    if( e.name === "setRepos" ) {
      settings = e.message;
      init();
    }
  }, false );

  // ask settings_proxy.html for user settings
  safari.self.tab.dispatchMessage( "getRepos" );
}

start()



