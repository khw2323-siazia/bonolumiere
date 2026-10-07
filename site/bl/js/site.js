(function(){
  'use strict';
  var b=document.querySelector('.burger'), m=document.getElementById('menu');
  function setMenu(open){ if(!b||!m) return; m.classList.toggle('open',open); b.setAttribute('aria-expanded',open?'true':'false'); b.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기'); document.body.classList.toggle('no-scroll',open); }
  if(b&&m){
    b.addEventListener('click',function(){ setMenu(!m.classList.contains('open')); });
    m.addEventListener('click',function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });
    window.addEventListener('resize',function(){ if(window.innerWidth>=1024) setMenu(false); });
  }
})();
