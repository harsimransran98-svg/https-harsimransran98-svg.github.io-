/* Servd: pick the frame mode (?mode=guest | ?mode=kitchen) before first paint. */
(function () {
  var m = new URLSearchParams(location.search).get('mode');
  document.documentElement.classList.add('mode-' + (m === 'kitchen' ? 'kitchen' : 'guest'));
  if (m === 'guest' || m === 'kitchen') document.documentElement.classList.add('framed');
})();
