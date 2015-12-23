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
      generateDOM();
    }
  }
}

function clear() {
  var productsElement = $('#products');

  if (productsElement) {
    productsElement.remove();
  }
}

function generateDOM() {
  // TODO: get from DB
  var products = [
    {
      title: 'Micro sd de 4gb',
      link: 'http://tiendas.mediamarkt.es/p/micro-sd-de-4gb-sandisk-hc-y-clase-4-1085193',
      imageLink: 'http://d243u7pon29hni.cloudfront.net/images/products/001_Tarjeta_MeM_4GB_Sandisk_m.jpg',
      price: '4.99'
    },
    {
      title: 'Pendrive de 8gb',
      link: 'http://tiendas.mediamarkt.es/p/pendrive-de-8gb-sandisk-cruzer-blade-usb-2.0-ultracompacto-color-negro-y-rojo-1117066',
      imageLink: 'http://d243u7pon29hni.cloudfront.net/images/products/002_1117066_m.jpg',
      price: '5.99'
    }
  ];

  var items = '';
  var tmpItem;

  products.forEach(function(item) {
    tmpItem = itemHtml.replace(new RegExp('{TITLE}', 'g'), item.title);
    tmpItem = tmpItem.replace('{LINK}', item.link);
    tmpItem = tmpItem.replace('{IMAGE_LINK}', item.imageLink);
    tmpItem = tmpItem.replace('{PRICE}', item.price);
    items += tmpItem;
  });

  var style = 'margin-left: 120px; margin-top: 10px;';
  var html = '<div id="products" style="' + style + '">' + items + '</div><div style="clear: both;"></div>';

  topNav = $('#cnt > .mw');
  if (topNav) {
    topNav.insertAdjacentHTML('afterend', html);
    return;
  }

  // if we are here the topNav is still not visible
  setTimeout(function() {
    console.log('topNav', topNav);
    topNav.insertAdjacentHTML('afterend', html);
  },0);
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

initContentScript();
