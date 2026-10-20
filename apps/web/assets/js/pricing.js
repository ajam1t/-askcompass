/* Pricing calculator: people × $1 per month. Plain arithmetic, nothing is sent. */
(function () {
  'use strict';
  var range = document.getElementById('pcRange'), num = document.getElementById('pcUsers');
  if (!range || !num) return;
  var month = document.getElementById('pcMonth'), year = document.getElementById('pcYear');
  var fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  function show(n) {
    n = Math.max(1, Math.min(100000, Math.round(+n) || 1));
    month.textContent = fmt.format(n);
    year.textContent = fmt.format(n * 12);
    range.style.setProperty('--p', (Math.min(n, +range.max) - 1) / (+range.max - 1) * 100 + '%');
    return n;
  }
  range.addEventListener('input', function () { num.value = show(range.value); });
  num.addEventListener('input', function () { if (num.value !== '') range.value = Math.min(show(num.value), +range.max); });
  num.addEventListener('change', function () { num.value = show(num.value); });
  show(range.value);
})();
