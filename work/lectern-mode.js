/* Lectern: pick the frame mode (?mode=student | ?mode=admin) before first paint,
   so the phone never flashes the dashboard header and vice versa. */
(function () {
  var m = new URLSearchParams(location.search).get('mode');
  if (m === 'student' || m === 'admin') document.documentElement.classList.add('framed', 'mode-' + m);
})();
