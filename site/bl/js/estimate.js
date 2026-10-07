(function(){
  'use strict';
  var C=window.BLC; if(!C) return;
  var $=function(s,r){return (r||document).querySelector(s);}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var KEY='bl_est', G=C.G;
  var LAB={
    '도배':{'베이직':'합지 · 기존 벽지 철거 포함','시그니처':'실크','프레스티지':'실크 (시그니처와 동일)'},
    '바닥':{'베이직':'기본형 강마루','시그니처':'광폭 강마루','프레스티지':'정사각 강마루(헤링본)'},
    '욕실':{'베이직':'표준 욕실 · SMC 욕조','시그니처':'고급 욕실 · 아크릴 욕조','프레스티지':'호텔 욕실 · 프리스탠딩 욕조'},
    '주방':{'베이직':'E0 PET 문짝 · 일반 상판','시그니처':'고급 인조대리석 상판','프레스티지':'칸스톤 상판'},
    '조명':{'베이직':'배선기구 교체','시그니처':'기구 + 천장 배선 신설','프레스티지':'고급 기구 + 배선 신설'}};
  var DIAG={'정상':'덧방','들뜸':'타일만 철거','누수':'올철거'};
  var PROCS=['도배','바닥','욕실','주방','조명'];
  var SUB={'도배':'천장 포함 · 빈집','바닥':'기존 마루 철거·걸레받이 포함','욕실':'상태와 개소 수를 골라요','주방':'하부장 길이 기준','조명':'기준 집 구성'};
  var EXTRA=['중문','필름','창호','발코니'];
  var PROCNAME={'공통':'공통 (철거·가설·인허가·청소 등)','도배':'도배','바닥':'바닥','천장':'천장','목공':'목공','조명':'조명','욕실':'욕실','주방':'주방','현관':'현관','침실(도어)':'방문·침실','발코니':'발코니','기타':'기타'};
  var ORDER=['공통','도배','바닥','천장','목공','조명','욕실','주방','현관','침실(도어)','발코니','기타'];
  var S=load()||{mode:'',py:26,grade:'시그니처',picked:false,items:{},baths:1,diag:'정상',kit:'4.8',extras:[]};
  function load(){ try{ return JSON.parse(sessionStorage.getItem(KEY)); }catch(e){ return null; } }
  function save(){ try{ sessionStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
  function fmt(x){ return C.fmt(x); }
  function opt(){ return {py:S.py,baths:S.baths,diag:S.diag,kit:S.kit}; }
  function nItems(){ return Object.keys(S.items).length; }
  function hasChoice(){ return S.mode==='full' ? !!S.picked : nItems()>0; }
  function cur(){ var n=parseInt((location.hash||'#1').slice(1),10); return (n>=1&&n<=6)?n:1; }
  function go(n){ if(location.hash==='#'+n) show(n); else location.hash='#'+n; }
  function guard(){ var n=cur(); if(n>=2&&!S.mode) n=1; if(n>=4&&!hasChoice()) n=(S.mode?3:1); if(n!==cur()) history.replaceState(null,'','#'+n); show(n); }
  window.addEventListener('hashchange',guard);

  function show(n){
    $$('.step').forEach(function(s){ s.classList.toggle('show',+s.dataset.step===n); });
    $$('.steps i').forEach(function(b,i){ b.classList.toggle('on',i<Math.min(n,5)); });
    var r={1:r1,2:r2,3:r3,4:r4,5:r5}[n]; if(r) r(); window.scrollTo(0,0);
  }
  function r1(){ $$('[data-mode]').forEach(function(b){ b.classList.toggle('on',b.dataset.mode===S.mode); }); }
  function r2(){ $('#py').value=S.py; $('#pyMsg').textContent=''; }
  function gradeCard(g){
    var tot=C.fullTotal(S.py,g), per=(tot/S.py/10000).toFixed(1);
    var up={'베이직':'꼭 필요한 곳을 새것으로. 깔끔하고 튼튼한 기본','시그니처':'가장 많이 고르는 구성 · 넓어 보이고 조명이 달라집니다','프레스티지':'호텔 같은 마감 · 욕실과 주방을 한 단계 더'}[g];
    return '<button type="button" class="opt'+(S.grade===g&&S.picked?' on':'')+'" data-grade="'+g+'"><b>'+g+(g==='시그니처'?' <em class="chip">가장 많이 선택</em>':'')+'</b><span>'+up+'</span><br><strong class="big">'+fmt(tot)+'</strong><br><span>'+S.py+'평 기준 · 평당 '+per+'만원 · VAT 별도</span></button>';
  }
  function procBlock(p){
    var chips='';
    if(p==='욕실'){
      chips='<div class="opt-chips">'+[1,2,3].map(function(n){ return '<button type="button" class="pill soft" data-pill="baths" data-v="'+n+'" aria-pressed="'+(S.baths===n)+'">'+n+'개소</button>'; }).join('')+'</div>'+
            '<div class="opt-chips">'+Object.keys(DIAG).map(function(d){ return '<button type="button" class="pill soft" data-pill="diag" data-v="'+d+'" aria-pressed="'+(S.diag===d)+'">'+d+' · '+DIAG[d]+'</button>'; }).join('')+'</div>';
    }
    if(p==='주방'){ chips='<div class="opt-chips">'+['3.6','4.8','6.0'].map(function(k){ return '<button type="button" class="pill soft" data-pill="kit" data-v="'+k+'" aria-pressed="'+(S.kit===k)+'">'+k+'m</button>'; }).join('')+'</div>'; }
    var rows=G.map(function(g){ var on=S.items[p]===g;
      return '<div class="gr'+(on?' on':'')+'" data-proc="'+p+'" data-g="'+g+'">'+(g==='시그니처'?'<span class="bd2">가장 많이 선택</span>':'')+'<div class="n">'+g+'<small>'+LAB[p][g]+'</small></div><div class="p">'+fmt(C.partial(p,g,opt()))+'</div><button type="button" class="'+(on?'a':'')+'">'+(on?'담김 ✓':'담기')+'</button></div>'; }).join('');
    var sel=S.items[p]?'<em>'+S.items[p]+' 담김</em>':'';
    return '<details class="ac" '+((p==='도배'||S.items[p])?'open':'')+'><summary><b>'+p+'</b><i>'+SUB[p]+'</i>'+sel+'</summary><div class="body">'+chips+'<div class="grades">'+rows+'</div></div></details>';
  }
  function r3(){
    var f=S.mode==='full';
    $('#pickFull').hidden=!f; $('#pickPartial').hidden=f;
    $('#py3').textContent=S.py;
    if(f){ $('#fullCards').innerHTML=G.map(gradeCard).join(''); }
    else{
      var open={}; $$('#partCards details').forEach(function(d){ open[d.querySelector('b').textContent]=d.open; });
      $('#partCards').innerHTML=PROCS.map(procBlock).join('');
      $$('#partCards details').forEach(function(d){ var k=d.querySelector('b').textContent; if(k in open) d.open=open[k]; });
      $('#extras').innerHTML=EXTRA.map(function(x){ return '<label class="check"><input type="checkbox" value="'+x+'"'+(S.extras.indexOf(x)>-1?' checked':'')+'> '+x+' — 구성에 따라 계산하는 공정이라 상담 때 견적을 드려요</label>'; }).join('');
      updNext();
    }
  }
  function updNext(){ var n=nItems(); var b=$('#toResult'); b.disabled=(n===0); b.textContent=n? ('담은 공정 '+n+'개 · 결과 보기'):'공정을 하나 이상 담아주세요'; }
  function r4(){
    var f=S.mode==='full', h='', total=0;
    if(f){
      total=C.fullTotal(S.py,S.grade);
      var rm=C.roundTo(C.fullProc(S.py,S.grade),total), keys=ORDER.filter(function(k){return rm[k]>0;});
      h='<div class="res-box"><small>'+S.grade+' · '+S.py+'평 예상 견적 (VAT 별도)</small><div class="big">'+fmt(total)+'</div></div>'+
        '<table class="kv" aria-label="공정별 금액">'+keys.map(function(k){ return '<tr><td>'+(PROCNAME[k]||k)+'</td><td>'+rm[k].toLocaleString('ko-KR')+'만원</td></tr>'; }).join('')+'<tr><td>합계</td><td>'+fmt(total)+'</td></tr></table>'+
        '<p class="hint">다른 등급과 비교</p><div class="cmp">'+G.map(function(g){ return '<button type="button" class="opt'+(g===S.grade?' on':'')+'" data-grade2="'+g+'"><b>'+g+'</b><span>'+fmt(C.fullTotal(S.py,g))+'</span></button>'; }).join('')+'</div>'+
        '<ul class="hint-list"><li>방3·욕실2·창 5개소 표준 구성 기준이에요. 확장·창호교체는 포함하지 않아요.</li><li>소방 공사는 별도예요(해당 시).</li><li>정확한 금액은 방문 실측 후 확정돼요.</li></ul>';
    } else {
      var rows=Object.keys(S.items).map(function(p){ var g=S.items[p], a=C.partial(p,g,opt()); total+=a;
        var lab=p==='욕실'? ('욕실 '+S.baths+'개소 · '+S.diag+'('+DIAG[S.diag]+') · '+g) : p==='주방'? ('주방 '+S.kit+'m · '+g) : (p+' · '+g+(p==='도배'||p==='바닥'?' ('+S.py+'평)':''));
        return '<tr><td>'+lab+'<br><small class="hint">'+LAB[p][g]+'</small></td><td>'+fmt(a)+'</td></tr>'; });
      h='<div class="res-box"><small>부분공사 예상 견적 (VAT 별도)</small><div class="big">'+fmt(total)+'</div></div><table class="kv" aria-label="선택한 공정">'+rows.join('')+'<tr><td>합계</td><td>'+fmt(total)+'</td></tr></table>'+
        (S.extras.length?'<p class="hint">상담 때 견적을 드릴 공정: '+S.extras.join(' · ')+'</p>':'')+
        '<ul class="hint-list"><li>공정별 단독 선택 금액의 합이에요. 같은 직종 공정을 함께 하면 실제 견적은 더 내려갈 수 있어요.</li><li>단독 금액에는 최소 시공비가 포함돼 있어요.</li><li>정확한 금액은 방문 실측 후 확정돼요.</li></ul>';
    }
    S.total=total; save(); $('#result').innerHTML=h;
  }
  function r5(){ var f=S.mode==='full'; $('#sumLine').textContent=f? (S.grade+' · '+S.py+'평 · '+fmt(C.fullTotal(S.py,S.grade))) : ('부분공사 '+nItems()+'개 · '+fmt(S.total||0)); }

  document.addEventListener('click',function(e){
    var t;
    if((t=e.target.closest('[data-mode]'))){ S.mode=t.dataset.mode; S.picked=false; if(S.mode==='partial'&&!nItems()) S.items={}; save(); go(2); return; }
    if((t=e.target.closest('[data-grade]'))){ S.grade=t.dataset.grade; S.picked=true; save(); go(4); return; }
    if((t=e.target.closest('[data-grade2]'))){ S.grade=t.dataset.grade2; save(); r4(); return; }
    if((t=e.target.closest('[data-pill]'))){ var k=t.dataset.pill,v=t.dataset.v; S[k]=(k==='baths')?parseInt(v,10):v; save(); r3(); return; }
    if((t=e.target.closest('.gr button'))){ var row=t.closest('.gr'),p=row.dataset.proc,g=row.dataset.g; if(S.items[p]===g) delete S.items[p]; else S.items[p]=g; save(); r3(); return; }
    if((t=e.target.closest('[data-go]'))){ go(parseInt(t.dataset.go,10)); return; }
    if(e.target.id==='pyMinus'){ setPy(S.py-1); return; } if(e.target.id==='pyPlus'){ setPy(S.py+1); return; }
    if((t=e.target.closest('[data-py]'))){ setPy(parseInt(t.dataset.py,10)); return; }
    if(e.target.id==='toResult'){ S.extras=$$('#extras input:checked').map(function(i){return i.value;}); save(); go(4); return; }
    if(e.target.id==='restart'){ S={mode:'',py:26,grade:'시그니처',picked:false,items:{},baths:1,diag:'정상',kit:'4.8',extras:[]}; save(); go(1); return; }
  });
  document.addEventListener('change',function(e){ if(e.target.closest('#extras')){ S.extras=$$('#extras input:checked').map(function(i){return i.value;}); save(); } if(e.target.id==='py'){ setPy(parseInt(e.target.value,10)); } });
  function setPy(v){ var lo=C.D.pyeong[0], hi=C.D.pyeong[C.D.pyeong.length-1]; if(isNaN(v)) v=26; var m=''; if(v<lo){ v=lo; m=lo+'평 미만은 상담으로 안내드려요.'; } if(v>hi){ v=hi; m=hi+'평 초과는 상담으로 안내드려요.'; } S.py=v; save(); $('#py').value=v; $('#pyMsg').textContent=m; }
  $('#py2next').addEventListener('click',function(){ setPy(parseInt($('#py').value,10)); go(3); });

  // 신청 전송
  var form=$('#estForm');
  if(form){ form.addEventListener('submit',function(e){
    e.preventDefault(); var hp=form.querySelector('[name=website]'); if(hp&&hp.value) return; if(!form.reportValidity()) return;
    var f=S.mode==='full', btn=form.querySelector('button[type=submit]'), err=$('#estErr'); var v=function(n){ return (form.elements[n].value||'').trim(); };
    var payload={name:v('name'),phone:v('phone'),address:v('address'),spaceType:'아파트',constructionMode:f?'full':'partial',pyeong:String(S.py),rooms:'',baths:'',balconies:'',
      tier:f?S.grade:Object.keys(S.items).map(function(p){return p+':'+S.items[p];}).join(', '),
      estimatePrice:f?fmt(C.fullTotal(S.py,S.grade)):fmt(S.total||0),
      visitDateTime:(v('visitDate')||'')+' '+(v('visitTime')||''), interestedOptions:f?[]:S.extras, referralCode:new URLSearchParams(location.search).get('ref')||''};
    var orig=btn.textContent; btn.textContent='전송 중...'; btn.disabled=true; err.textContent='';
    window.BLPost('estimate',payload).then(function(j){
      if(j&&j.ok){ $('#doneSub').textContent=payload.name+'님, 신청 감사해요. '+(v('visitDate')?(v('visitDate')+' '+v('visitTime')+' 방문 희망 일정으로 '):'')+'곧 담당자가 연락드릴게요.'; try{ sessionStorage.removeItem(KEY); }catch(x){} history.replaceState(null,'','#6'); show(6); }
      else err.textContent='죄송해요, 잠시 후 다시 시도해주세요.';
    }).catch(function(){ err.textContent='네트워크 오류가 발생했어요. 다시 시도해주세요.'; }).then(function(){ btn.textContent=orig; btn.disabled=false; });
  }); }
  var q=new URLSearchParams(location.search); if(q.get('py')){ var pv=parseInt(q.get('py'),10); if(pv) S.py=pv; }
  guard();
})();
