// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function(details) {
  // TODO: generate id
  // TODO: make POST request
  var id = 1;
  getHttp('https://gamelanguage.com/install', installed);

  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'google.es' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.runtime.setUninstallURL('https://gamelanguage.com/uninstall', function() {
  console.log('uninstalled');
  // TODO: make POST request
  getHttp('https://gamelanguage.com/install', installed);
});

function installed(err, data) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('installed');
}

function uninstalled(err, data) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('uninstalled');
}

function getHttp(url, cb) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var resp = request.responseText;
      return cb(null, resp);
    } else {
      // We reached our target server, but it returned an error
      return cb('error. status:' + request.status + ' text:' + request.responseText, null);
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    return cb('connection error', null);
  };

  request.send();
}
