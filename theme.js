/* Light / dark theme. Light is the default; the visitor's choice is remembered.
   Loaded in <head> without defer so the page never flashes the wrong theme. */
(function(){
  var root = document.documentElement, saved = null;
  try { saved = localStorage.getItem('theme'); } catch(e){}
  function apply(t){
    if(t === 'dark') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    var m = document.querySelector('meta[name="theme-color"]');
    if(m) m.content = t === 'dark' ? '#09090b' : '#ECE1CE';
  }
  apply(saved === 'dark' ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('themeBtn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem('theme', next); } catch(e){}
    });
  });
})();
