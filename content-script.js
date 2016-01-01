'use strict';
/* global chrome:true*/

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

var ENTER = 13;
var LEFT_CLICK = 0;
var topNav;
var itemHtml;
var storage = chrome.storage.local;
var userID = 0;

function initContentScript() {
  getItem(function(html) {
    itemHtml = html;
  });

  storage.get('id', function(keys) {
    if (keys.id) {
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
    console.log(err);
    return;
  }

  var results = {};
  try {
    results = JSON.parse(data);
  } catch (e) {
    console.error('error parsing json. data:', data);
    return;
  }

  if (results.userID) {
    storage.set({id: results.userID}, function() {});
  }

  var items = '';
  var tmpItem;

  results.products.forEach(function(item) {
    tmpItem = itemHtml.replace(new RegExp('{TITLE}', 'g'), item.title);
    // tmpItem = tmpItem.replace(new RegExp('{SHORT_TITLE}', 'g'), item.title.substring(0,15) + '...');
    tmpItem = tmpItem.replace('{LINK}', item.link);
    tmpItem = tmpItem.replace('{IMAGE_LINK}', item.imageLink);
    tmpItem = tmpItem.replace('{ID}', item.id);
    tmpItem = tmpItem.replace('{PRICE}', item.price);
    items += tmpItem;
  });

  var style = 'margin-left: 120px; margin-top: 10px;';
  var html = '<div id="products" style="' + style + '"><p>Productos de Media Markt</p>' + items + '</div>';

  topNav = $('#top_nav');
  if (topNav) {
    topNav.insertAdjacentHTML('beforebegin', html);
    addClickHandles();
    return;
  }

  waitForElement(100, html);
}

// wait 30 ms until DOM is available before adding to DOM
// try 100 times
function waitForElement(attempt, html) {
  setTimeout(function() {
    topNav = $('#top_nav');
    if (topNav) {
      topNav.insertAdjacentHTML('beforebegin', html);
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
}

function logClickDone(err) {
  if (err) {
    console.log('calling /click returns error:', err);
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
