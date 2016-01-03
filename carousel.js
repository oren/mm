//carousel

var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
var products;
var offset = 0;
var next;
var prev;
var total;

function attachNext() {
  next = $("#products .next")
  next.addEventListener('click', nextProduct);
  prev = $("#products .prev")
  prev.addEventListener('click', prevProduct);

  products = $$('#products > div');
  products = Array.prototype.slice.call(products, 0);
  total = products.length;
}

function nextProduct(e) {
  e.preventDefault();
  e.stopPropagation();

  products[offset].style.display= 'none';
  products[offset + 5].style.display= 'inline-block';
  offset += 1;

  if (total - offset === 5) {
    next.style.display = 'none';
  }

  if (offset > 0) {
    prev.style.display = '';
  }
}

function prevProduct(e) {
  e.preventDefault();
  e.stopPropagation();

  products[offset - 1].style.display= 'inline-block';
  products[offset + 4].style.display= 'none';
  offset -= 1;

  if (offset === 0) {
    prev.style.display = 'none';
  }
  if (offset < 5) {
    next.style.display = '';
  }
}
