'use strict';
/* global chrome:true*/

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

var ENTER = 13;
var LEFT_CLICK = 0;
var appBar;
var itemHtml;
var storage = chrome.storage.local;
var userID = 0;

function initContentScript() {
  getItem(function(html) {
    itemHtml = html;
  });

  storage.get('id', function(keys) {
    if (keys.id) {
      window.foobar = keys.id;
      userID = keys.id;
    }
  });

  var searchButton = $('.lsb');
  searchButton.addEventListener('click', search);

  var searchBox = $('#lst-ib');
  searchBox.addEventListener('keydown', search);

  function search(e) {
    setTimeout(function() {
      if (!searchBox.value) {
        clear();
      }
    },0);

    if (e.keyCode === ENTER || e.keyCode === LEFT_CLICK) {
      clear();
      getHttp('https://gamelanguage.com/search?id=' + userID + '&q=' + searchBox.value, generateDOM);
    }
  }
}

function clear() {
  var productsElement = $('#products');

  if (productsElement) {
    productsElement.remove();
  }
}

function generateDOM(err, data) {
  if (err) {
    // console.log(err);
    return;
  }

  var results = {};
  try {
    results = JSON.parse(data);
  } catch (e) {
    // console.error('error parsing json. data:', data);
    return;
  }

  if (results.userID) {
    storage.set({id: results.userID}, function() {});
  }

  var items = '';
  var tmpItem;

  results.products.forEach(function(item, index) {
    var shortTitle = item.title.length > 19 ? item.title.substring(0,19) + '...' : item.title;
    tmpItem = itemHtml.replace(new RegExp('{TITLE}', 'g'), item.title);
    tmpItem = tmpItem.replace(new RegExp('{SHORT_TITLE}', 'g'), shortTitle);
    tmpItem = tmpItem.replace('{LINK}', item.link);
    tmpItem = tmpItem.replace('{IMAGE_LINK}', item.imageLink);
    tmpItem = tmpItem.replace('{ID}', item.id);
    tmpItem = tmpItem.replace('{PRICE}', item.price);
    if (index > 4) {
      // hide product
      tmpItem = tmpItem.replace('inline-block', '');
    }
    items += tmpItem;
  });

  var showNext = 'none';
  if (results.products.length > 5) {
    showNext = '';
  }

  var style = 'margin-left: 134px; color: #1a0dab; font-size: 18px; position: relative;';
  var prev='<a class="prev" href="#" style="display: none; position: absolute; top:83px; left: -23px; text-decoration: none;">&lt;</a>';
  var next='<a class="next" href="#" style="display: ' + showNext + '; position: absolute; top:83px; left: 620px; text-decoration: none;">&gt;</a>';
  var html = '<div id="products" style="' + style + '"><p>Resultados de MediaMarkt</p>' + prev + items + next + '</div>';

  appBar = $('.appbar');
  if (appBar) {
    appBar.insertAdjacentHTML('afterEnd', html);
    addClickHandles();
    return;
  }

  waitForElement(100, html);
}

// wait 30 ms until DOM is available before adding to DOM
// try 100 times
function waitForElement(attempt, html) {
  setTimeout(function() {
    appBar = $('.appbar');
    if (appBar) {
      appBar.insertAdjacentHTML('afterEnd', html);
      addClickHandles();
      return;
    }

    attempt -= 1;
    if (attempt === 0) {
      return;
    }

    waitForElement(attempt, html);
  },30);
}

function addClickHandles() {
  var products = $$('#products a img');
  products = Array.prototype.slice.call(products, 0);

  for (var i = 0; i < products.length; i++) {
    var id = products[i].dataset.id;
    products[i].addEventListener('click', bindClick(id));
  }

  function bindClick(productID) {
    return function() {
      getHttp('https://gamelanguage.com/click?id=' + userID + '&pid=' + productID, logClickDone);
    };
  }

  if (products.length > 5) {
    // carousel code
    attachNext();
  }
}

function logClickDone(err) {
  if (err) {
    // console.log('calling /click returns error:', err);
  }
}

function getItem(cb) {
  var url = chrome.extension.getURL('templates/item.html');
  var req = new XMLHttpRequest();

  req.open('GET', url, true);
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      cb(req.responseText);
    }
  };
  req.send(null);
  return req;
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

initContentScript();
