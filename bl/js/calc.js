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
  // ===== 견적 화면용 조합표(평수·방·화장실·베란다·확장) — 엔진 직접 계산값, 평수 사이는 보간 =====
  var ge=document.getElementById('bl-grid'), EST=null;
  if(ge){
    var Z=JSON.parse(ge.textContent), M=Z.meta, NR=M.R.length, NB=M.B.length, NV=M.V.length, NE=M.E.length, ORDERP=['도배','바닥','욕실','주방','조명','발코니'];
    var ix=function(arr,v){ var i=arr.indexOf(v); return i<0?0:i; };
    var segp=function(py){ var P=M.py; py=Math.max(P[0],Math.min(P[P.length-1],py)); for(var i=0;i<P.length-1;i++){ if(py>=P[i]&&py<=P[i+1]) return [i,i+1,(py-P[i])/(P[i+1]-P[i])]; } return [P.length-1,P.length-1,0]; };
    var lerpPy=function(get,py){ var s=segp(py), a=get(s[0]), b=get(s[1]); return a+(b-a)*s[2]; };
    var efull=function(inp,g){ var gi=G.indexOf(g), ri=ix(M.R,inp.rooms), bi=ix(M.B,inp.baths), vi=ix(M.V,inp.balc), ei=ix(M.E,inp.ext);
      return Math.round(lerpPy(function(pi){ return Z.full[((((pi*NR+ri)*NB+bi)*NV+vi)*NE+ei)*3+gi]; },inp.py)); };
    var esingle=function(proc,g,inp){ var gi=G.indexOf(g), ri=ix(M.R,inp.rooms), bi=ix(M.B,inp.baths), ei=ix(M.E,inp.ext);
      if(proc==='도배') return Math.round(lerpPy(function(pi){ return Z.dobae[((pi*NR+ri)*NE+ei)*3+gi]; },inp.py));
      if(proc==='바닥') return Math.round(lerpPy(function(pi){ return Z.bakdak[(((pi*NR+ri)*NB+bi)*NE+ei)*3+gi]; },inp.py));
      if(proc==='조명') return Math.round(lerpPy(function(pi){ return Z.jomyeong[((pi*NR+ri)*NE+ei)*3+gi]; },inp.py));
      if(proc==='욕실') return Z.yokshil[bi*3+gi];
      if(proc==='주방') return Z.jubang[gi];
      if(proc==='발코니'){ var v=Math.max(1,Math.min(4,inp.balc||1)); return Z.balcony[(ei*4+(v-1))*3]; }
      return 0; };
    // 담은 공정 합계 = 단품 합 − 묶음 보정(엔진은 최소 시공비·철거 하한 같은 공통 보정을 한 번만 적용)
    var ebasket=function(items,inp){ var procs=ORDERP.filter(function(p){ return p in items; }), lines=[], sum=0, cnt={};
      procs.forEach(function(p){ var a=esingle(p,items[p],inp); lines.push({proc:p,grade:items[p],amount:a}); sum+=a; if(p!=='발코니') cnt[items[p]]=(cnt[items[p]]||0)+1; });
      var corr=0, tab=Z.corr[procs.join('+')];
      if(procs.length>=2 && tab){ var arr=tab[String(inp.baths)]||tab['2']; if(Array.isArray(arr[0])) arr=arr[ix(M.E,inp.ext)]||arr[0]; var tot=0, n=0; Object.keys(cnt).forEach(function(g){ tot+=cnt[g]*arr[G.indexOf(g)]; n+=cnt[g]; }); corr=n?tot/n:arr[0]; }
      return {total:Math.round(sum-corr),corr:Math.round(corr),lines:lines}; };
    var typical=function(py){ return py<=22?{rooms:2,baths:1}:(py>=40?{rooms:4,baths:2}:{rooms:3,baths:2}); };
    EST={meta:M,full:efull,single:esingle,basket:ebasket,typical:typical};
  }
  w.BLC={D:D,G:G,fullTotal:fullTotal,fullProc:fullProc,partial:partial,man:man,fmt:fmt,roundTo:roundTo,est:EST};
})(window);
