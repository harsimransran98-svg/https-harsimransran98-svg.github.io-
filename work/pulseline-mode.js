/* Pulseline: pick the frame mode (?mode=patient | ?mode=clinic) before first paint. */
(function () {
  var m = new URLSearchParams(location.search).get('mode');
  document.documentElement.classList.add('mode-' + (m === 'clinic' ? 'clinic' : 'patient'));
  if (m === 'patient' || m === 'clinic') document.documentElement.classList.add('framed');
})();
