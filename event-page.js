'use strict';
/* global chrome:true*/

// when the extension is updated to a new version, and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener(function(details) {
  getHttp('https://gamelanguage.com/install?reason=' + details.reason, installed);

  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: 'google.es' }
          })
        ],
        // And shows the extension's page action.
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

chrome.runtime.setUninstallURL('https://gamelanguage.com/uninstall', function() {
  var id = '0';
  console.log('before get');
  chrome.storage.local.get('id', function(keys) {
    console.log('inside get');
    if (keys.id) {
      id = keys.id;
    }

    getHttp('https://gamelanguage.com/uninstall?log=true&id=' + id, uninstalled);
  });

  // setTimeout(function () {
  //   getHttp('https://gamelanguage.com/uninstall?log=true&id=' + id, uninstalled);
  // }, 100)

});

function installed(err, data) {
  console.log('in installed callback. data:', data);
  if (err) {
    console.log(err);
    return;
  }

  chrome.storage.local.set({id: data}, function() {});
}

function uninstalled(err) {
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
