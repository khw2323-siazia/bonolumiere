(function(){
  'use strict';
  var C=window.BLC; if(!C) return;
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var S={py:26,baths:1,diag:'정상',kit:'4.8',sel:{}};
  var ST='bl_est';
  function render(){
    $$('.gr[data-proc]').forEach(function(r){
      var p=r.dataset.proc,g=r.dataset.g, a=C.partial(p,g,S), s=r.querySelector('.p'); if(s) s.textContent=C.fmt(a);
      var on=S.sel[p]===g; r.classList.toggle('on',on); var b=r.querySelector('button'); if(b){ b.classList.toggle('a',on); b.textContent=on?'담김 ✓':'담기'; }
    });
    $$('[data-pill]').forEach(function(b){ var k=b.dataset.pill, v=b.dataset.v; var cur=String(S[k]); b.setAttribute('aria-pressed',cur===v?'true':'false'); });
    $$('.tbl tr[data-py]').forEach(function(tr){ tr.classList.toggle('on',+tr.dataset.py===S.py); });
    var n=0,t=0; Object.keys(S.sel).forEach(function(p){ n++; t+=C.partial(p,S.sel[p],S); });
    var bar=document.getElementById('sum'); if(bar){ bar.hidden=(n===0); bar.querySelector('.cnt').textContent='담은 공정 '+n+'개'; bar.querySelector('b').textContent=C.fmt(t); }
    document.body.classList.toggle('has-sum',n>0);
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-pill]'); if(t){ var k=t.dataset.pill, v=t.dataset.v; S[k]=(k==='py'||k==='baths')?parseInt(v,10):v; render(); return; }
    var b=e.target.closest('.gr button'); if(b){ var r=b.closest('.gr'),p=r.dataset.proc,g=r.dataset.g; if(S.sel[p]===g) delete S.sel[p]; else S.sel[p]=g; render(); return; }
    var go=e.target.closest('#sum a'); if(go){ var items={}; Object.keys(S.sel).forEach(function(p){ items[p]=S.sel[p]; });
      try{ sessionStorage.setItem(ST,JSON.stringify({mode:'partial',py:S.py,grade:'시그니처',items:items,baths:S.baths,diag:S.diag,kit:S.kit,extras:[]})); }catch(x){} }
  });
  render();
})();
