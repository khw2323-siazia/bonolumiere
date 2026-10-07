(function(w){
  'use strict';
  var el=document.getElementById('bl-data'); if(!el) return;
  var D=JSON.parse(el.textContent), G=['베이직','시그니처','프레스티지'], PY=D.pyeong;
  function seg(p){ p=Math.max(PY[0],Math.min(PY[PY.length-1],p)); for(var i=0;i<PY.length-1;i++){ if(p>=PY[i]&&p<=PY[i+1]) return [PY[i],PY[i+1],p]; } var l=PY[PY.length-1]; return [l,l,p]; }
  function lerp(a,b,lo,hi,p){ return lo===hi?a:a+(b-a)*(p-lo)/(hi-lo); }
  function fullTotal(p,g){ var s=seg(p); return Math.round(lerp(D.full[s[0]][g].total,D.full[s[1]][g].total,s[0],s[1],s[2])); }
  function fullProc(p,g){ var s=seg(p), a=D.full[s[0]][g].byProc, b=D.full[s[1]][g].byProc, o={}; Object.keys(a).forEach(function(k){ o[k]=lerp(a[k],b[k]||0,s[0],s[1],s[2]); }); return o; }
  function partial(proc,g,o){ o=o||{}; var m=D.partial[proc], s;
    if(proc==='도배'||proc==='바닥'){ s=seg(o.py||26); return Math.round(lerp(m[s[0]][g],m[s[1]][g],s[0],s[1],s[2])); }
    if(proc==='조명') return m[g];
    if(proc==='욕실') return m[String(o.baths||1)][o.diag||'정상'][g];
    if(proc==='주방') return m[o.kit||'4.8'][g];
    return null; }
  function man(x){ return Math.round(x/10000); }
  function fmt(x){ return man(x).toLocaleString('ko-KR')+'만원'; }
  function roundTo(map,total){ var keys=Object.keys(map), r={}, sum=0; keys.forEach(function(k){ r[k]=man(map[k]); sum+=r[k]; }); var diff=man(total)-sum; if(diff!==0&&keys.length){ keys.sort(function(a,b){return r[b]-r[a];}); r[keys[0]]+=diff; } return r; }
  w.BLC={D:D,G:G,fullTotal:fullTotal,fullProc:fullProc,partial:partial,man:man,fmt:fmt,roundTo:roundTo};
})(window);
