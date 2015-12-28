'use strict';

var $ = document.querySelector.bind(document);
var ENTER = 13;
var LEFT_CLICK = 0;
var topNav;
var itemHtml;

function initContentScript() {
  getItem(function(html) {
    itemHtml = html;
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
      getHttp('https://gamelanguage.com/search?q=' + searchBox.value, generateDOM);
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

  var products = [];
  try {
    products = JSON.parse(data);
  } catch (e) {
    console.error('error parsing json. data:', data);
    return;
  }

  var items = '';
  var tmpItem;

  products.forEach(function(item) {
    tmpItem = itemHtml.replace(new RegExp('{TITLE}', 'g'), item.title);
    // tmpItem = tmpItem.replace(new RegExp('{SHORT_TITLE}', 'g'), item.title.substring(0,15) + '...');
    tmpItem = tmpItem.replace('{LINK}', item.link);
    tmpItem = tmpItem.replace('{IMAGE_LINK}', item.imageLink);
    tmpItem = tmpItem.replace('{PRICE}', item.price);
    items += tmpItem;
  });

  var style = 'margin-left: 120px; margin-top: 10px;';
  var html = '<div id="products" style="' + style + '"><p>Productos de Media Markt</p>' + items + '</div>';

  topNav = $('#top_nav');
  if (topNav) {
    topNav.insertAdjacentHTML('beforebegin', html);
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
      return;
    }

    attempt -= 1;
    if (attempt === 0) {
      return;
    }

    waitForElement(attempt, html);
  },30);
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
