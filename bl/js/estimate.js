(function(){
  'use strict';
  var C=window.BLC; if(!C||!C.est) return;
  var E=C.est, G=C.G;
  var $=function(s,r){return (r||document).querySelector(s);}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var KEY='bl_est2', OLD='bl_est', TABLE='T1', ENGINE=E.meta.engine||'';
  var EXTL=['안 됨','거실만','거실+안방'];
  var PROCS=['도배','바닥','욕실','주방','조명'];
  var NAME={'도배':'도배','바닥':'바닥','욕실':'화장실','주방':'주방','조명':'조명','발코니':'베란다 탄성코트'};
  var LAB={
    '도배':{'베이직':'합지 · 기존 벽지 철거 포함','시그니처':'실크','프레스티지':'실크 (시그니처와 동일)'},
    '바닥':{'베이직':'기본형 강마루','시그니처':'광폭 강마루','프레스티지':'정사각 강마루'},
    '욕실':{'베이직':'표준 욕실 · SMC 욕조','시그니처':'고급 욕실 · 아크릴 욕조','프레스티지':'호텔 욕실 · 프리스탠딩 욕조'},
    '주방':{'베이직':'E0 PET 문짝 · 일반 상판','시그니처':'고급 인조대리석 상판','프레스티지':'칸스톤 상판'},
    '조명':{'베이직':'배선기구 교체','시그니처':'기구 + 천장 배선 신설','프레스티지':'고급 기구 + 배선 신설'}};
  var SUB={'도배':'천장 포함 · 빈집 기준','바닥':'걸레받이 포함 · 프레스티지만 기존 마루 철거 포함','욕실':'정상 상태 기준 · 상태는 방문 후 확정','주방':'하부장 4.8m 기준','조명':'기준 집 구성'};
  var EXTRA=['중문','필름','창호','발코니 확장'];
  var DEF={py:26,rooms:3,baths:2,balc:0,ext:0,tr:false,tb:false,mode:'',grade:'시그니처',picked:false,items:{},extras:[],sent:false};
  var noScroll=false;
  function fresh(){ return JSON.parse(JSON.stringify(DEF)); }
  var S=load();
  function load(){
    var s=null; try{ s=JSON.parse(sessionStorage.getItem(KEY)); }catch(e){}
    s=Object.assign(fresh(),s||{}); s.items=s.items||{}; s.extras=s.extras||[];
    try{ var o=JSON.parse(sessionStorage.getItem(OLD));            // 가격 안내 화면에서 담아 온 공정 이어받기
      if(o&&o.mode==='partial'&&o.items&&Object.keys(o.items).length){ s.mode='partial'; s.py=o.py||s.py; s.items=o.items; if(o.baths){ s.baths=o.baths; s.tb=true; } s.sent=false; }
      sessionStorage.removeItem(OLD); }catch(e){}
    return s; }
  function save(){ try{ sessionStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
  function fmt(x){ return C.fmt(x); }
  function inp(){ return {py:S.py,rooms:S.rooms,baths:S.baths,balc:S.balc,ext:S.ext}; }
  function itemsAll(){ var it={}; Object.keys(S.items).forEach(function(p){ it[p]=S.items[p]; }); if(S.balc>0) it['발코니']='베이직'; return it; }
  function tot(){
    if(S.mode==='full'){ return S.picked?{n:1,total:E.full(inp(),S.grade),corr:0,lines:[]}:{n:0,total:0,corr:0,lines:[]}; }
    var it=itemsAll(), n=Object.keys(it).length; if(!n) return {n:0,total:0,corr:0,lines:[]};
    var b=E.basket(it,inp()); return {n:n,total:b.total,corr:b.corr,lines:b.lines}; }
  function hasChoice(){ return tot().n>0; }
  function houseText(){ return S.py+'평 · 방 '+S.rooms+' · 화장실 '+S.baths+' · 베란다 '+S.balc+' · 확장 '+EXTL[S.ext]; }

  // ----- 화면 이동 -----
  function stepOf(){ var h=(location.hash||'#1').slice(1); if(h==='apply'||h==='4') return 2; var n=parseInt(h,10); return (n>=1&&n<=3)?n:1; }
  function guard(){
    var h=(location.hash||'').slice(1), n=stepOf();
    if(n===3&&!S.sent) n=1;
    if(n===2&&!S.mode) n=1;
    var apply=(h==='apply')&&n===2&&hasChoice();
    if(h==='apply'&&!apply) history.replaceState(null,'','#'+n);
    else if((h==='4'||h==='')&&n!==1) history.replaceState(null,'','#'+n);
    show(n); sheet(apply); }
  function go(n){ if(location.hash==='#'+n) guard(); else location.hash='#'+n; }
  window.addEventListener('hashchange',guard); window.addEventListener('popstate',guard);
  function show(n){
    $$('.step').forEach(function(s){ s.classList.toggle('show',+s.dataset.step===n); });
    $$('.steps i').forEach(function(b,i){ b.classList.toggle('on',i<n); });
    ({1:r1,2:r2,3:function(){}})[n](); updBar(n); if(!noScroll) window.scrollTo(0,0); noScroll=false; }

  // ----- 1단계: 우리 집 -----
  function typicalApply(){ var t=E.typical(S.py); if(!S.tr) S.rooms=t.rooms; if(!S.tb) S.baths=t.baths; }
  function r1(){
    $('#py').value=S.py;
    $$('[data-k]').forEach(function(b){ b.setAttribute('aria-pressed',String(parseInt(b.dataset.v,10)===S[b.dataset.k])); });
    var t=E.typical(S.py);
    $('#infoHint').textContent=S.py+'평은 보통 방 '+t.rooms+'개 · 화장실 '+t.baths+'개예요. 다르면 눌러서 바꿔 주세요.'; }
  function setPy(v){
    var P=E.meta.py, lo=P[0], hi=P[P.length-1], m=''; if(isNaN(v)) v=26;
    if(v<lo){ v=lo; m=lo+'평 미만은 상담으로 안내드려요.'; } if(v>hi){ v=hi; m=hi+'평 초과는 상담으로 안내드려요.'; }
    S.py=v; typicalApply(); save(); r1(); $('#pyMsg').textContent=m; }

  // ----- 2단계: 고르기 -----
  function gradeCard(g){
    var t=E.full(inp(),g), per=(t/S.py/10000).toFixed(1);
    var up={'베이직':'꼭 필요한 곳을 새것으로. 깔끔하고 튼튼한 기본','시그니처':'가장 많이 고르는 구성 · 넓어 보이고 조명이 달라집니다','프레스티지':'호텔 같은 마감 · 욕실과 주방을 한 단계 더'}[g];
    return '<button type="button" class="opt'+(S.picked&&S.grade===g?' on':'')+'" data-grade="'+g+'"><b>'+g+(g==='시그니처'?' <em class="chip">가장 많이 선택</em>':'')+'</b><span>'+up+'</span><br><strong class="big">'+fmt(t)+'</strong><br><span>평당 '+per+'만원 · VAT 별도'+(S.picked&&S.grade===g?' · 선택됨 ✓':'')+'</span></button>'; }
  function procBlock(p){
    var rows=G.map(function(g){ var on=S.items[p]===g;
      return '<div class="gr'+(on?' on':'')+'" data-proc="'+p+'" data-g="'+g+'">'+(g==='시그니처'?'<span class="bd2">가장 많이 선택</span>':'')+'<div class="n">'+g+'<small>'+LAB[p][g]+'</small></div><div class="p">'+fmt(E.single(p,g,inp()))+'</div><button type="button" class="'+(on?'a':'')+'">'+(on?'담김 ✓':'담기')+'</button></div>'; }).join('');
    var sel=S.items[p]?'<em>'+S.items[p]+' 담김</em>':'';
    var sub=p==='욕실'?('화장실 '+S.baths+'개 · 정상 상태 기준 · 상태는 방문 후 확정'):SUB[p];
    return '<details class="ac" '+((p==='도배'||S.items[p])?'open':'')+'><summary><b>'+NAME[p]+'</b><i>'+sub+'</i>'+sel+'</summary><div class="body"><div class="grades">'+rows+'</div></div></details>'; }
  function r2(){
    var f=S.mode==='full';
    $('#pickFull').hidden=!f; $('#pickPartial').hidden=f;
    $('#infoSum').innerHTML=houseText()+' <button type="button" class="linkbtn" data-go="1">수정</button>';
    if(f){ $('#fullCards').innerHTML=G.map(gradeCard).join(''); }
    else{
      var open={}; $$('#partCards details').forEach(function(d){ open[d.querySelector('b').textContent]=d.open; });
      var bal=S.balc>0?('<div class="gr on est-auto"><div class="n">베란다 탄성코트 '+S.balc+'곳<small>바닥 300×300 타일 덧방 · 최소 시공비 포함 · 자동 포함</small></div><div class="p">'+fmt(E.single('발코니','베이직',inp()))+'</div></div>'):'';
      $('#partCards').innerHTML=bal+PROCS.map(procBlock).join('');
      $$('#partCards details').forEach(function(d){ var k=d.querySelector('b').textContent; if(k in open) d.open=open[k]; });
      $('#extras').innerHTML=EXTRA.map(function(x){ return '<label class="check"><input type="checkbox" value="'+x+'"'+(S.extras.indexOf(x)>-1?' checked':'')+'> '+x+' — 구성에 따라 계산하는 공정이라 상담 때 견적을 드려요</label>'; }).join(''); }
    updBar(2); }

  // ----- 하단 바 · 내역 -----
  function updBar(n){
    var bar=$('#estBar'), t=tot(), on=(n===2&&t.n>0);
    bar.hidden=!on; document.body.classList.toggle('has-estbar',on);
    if(!on){ $('#estPanel').hidden=true; return; }
    var f=S.mode==='full';
    $('#barCnt').textContent=f?(S.grade+' · '+S.py+'평'):('담은 공정 '+t.n+'개');
    $('#barTot').textContent=fmt(t.total)+' (VAT 별도)';
    $('#barNote').textContent=(!f&&t.corr>0)?('묶어서 하면 −'+C.man(t.corr)+'만원 반영'):'정확한 견적은 방문 후 확정';
    renderPanel(t); }
  function renderPanel(t){
    var f=S.mode==='full', h='';
    if(f){ h='<table class="kv"><tr><td>'+S.grade+' 전체공사</td><td>'+fmt(t.total)+'</td></tr></table>'; }
    else{ h='<table class="kv">'+t.lines.map(function(l){ return '<tr><td>'+NAME[l.proc]+(l.proc==='발코니'?' '+S.balc+'곳':' · '+l.grade)+'</td><td>'+fmt(l.amount)+'</td></tr>'; }).join('')+
      (t.corr>0?'<tr><td>묶어서 하면 <small class="hint">(공통 비용 한 번만)</small></td><td>−'+fmt(t.corr)+'</td></tr>':'')+'<tr><td><b>합계</b></td><td><b>'+fmt(t.total)+'</b></td></tr></table>'; }
    $('#estPanel').innerHTML='<p class="hint">'+houseText()+'</p>'+h+'<ul class="hint-list"><li>화장실은 정상 상태, 주방은 표준 길이 기준이에요. 확장·창호교체 공사비는 포함하지 않아요.</li><li>소방 공사는 별도예요(해당 시).</li><li>정확한 견적은 방문 실측 후 확정돼요.</li></ul>'; }

  // ----- 상담 신청 창 -----
  function sheet(on){
    $('#sheet').hidden=!on; $('#sheetBg').hidden=!on; document.documentElement.style.overflow=on?'hidden':'';
    if(on){ var t=tot(); $('#sumLine').textContent=(S.mode==='full'?(S.grade+' 전체공사'):('부분공사 '+t.n+'개'))+' · '+fmt(t.total)+' (VAT 별도) · '+houseText(); var fn=$('#f-name'); if(fn&&!fn.value) setTimeout(function(){ try{ fn.focus({preventScroll:true}); }catch(e){} },60); } }
  function closeSheet(){ if((location.hash||'')==='#apply') history.back(); else sheet(false); }

  // ----- 이벤트 -----
  document.addEventListener('click',function(e){
    var t;
    if((t=e.target.closest('[data-k]'))){ var k=t.dataset.k; S[k]=parseInt(t.dataset.v,10); if(k==='rooms') S.tr=true; if(k==='baths') S.tb=true; save(); r1(); return; }
    if((t=e.target.closest('[data-mode]'))){ var m=t.dataset.mode; if(S.mode!==m){ S.mode=m; if(m==='full') S.picked=false; } save(); go(2); return; }
    if((t=e.target.closest('[data-grade]'))){ S.grade=t.dataset.grade; S.picked=true; save(); noScroll=true; r2(); return; }
    if((t=e.target.closest('.gr button'))){ var row=t.closest('.gr'), p=row.dataset.proc, g=row.dataset.g; if(S.items[p]===g) delete S.items[p]; else S.items[p]=g; save(); r2(); return; }
    if((t=e.target.closest('[data-go]'))){ go(parseInt(t.dataset.go,10)); return; }
    if(e.target.id==='pyMinus'){ setPy(S.py-1); return; } if(e.target.id==='pyPlus'){ setPy(S.py+1); return; }
    if((t=e.target.closest('[data-py]'))){ setPy(parseInt(t.dataset.py,10)); return; }
    if(e.target.closest('#barToggle')){ var pn=$('#estPanel'); pn.hidden=!pn.hidden; return; }
    if(e.target.id==='barGo'){ if(hasChoice()){ $('#estPanel').hidden=true; location.hash='#apply'; } return; }
    if(e.target.id==='sheetX'||e.target.id==='sheetBg'){ closeSheet(); return; }
    if(e.target.id==='restart'){ S=fresh(); save(); go(1); return; }
  });
  document.addEventListener('change',function(e){
    if(e.target.closest('#extras')){ S.extras=$$('#extras input:checked').map(function(i){return i.value;}); save(); }
    if(e.target.id==='py'){ setPy(parseInt(e.target.value,10)); } });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!$('#sheet').hidden) closeSheet(); });

  // ----- 신청 전송 -----
  var form=$('#estForm');
  if(form){ form.addEventListener('submit',function(e){
    e.preventDefault(); var hp=form.querySelector('[name=website]'); if(hp&&hp.value) return; if(!form.reportValidity()) return;
    var f=S.mode==='full', t=tot(), btn=form.querySelector('button[type=submit]'), err=$('#estErr'); var v=function(n){ return (form.elements[n].value||'').trim(); };
    var dong=v('dong'); if(/^\d+$/.test(dong)) dong+='동'; var cx=v('complex');
    var opts=f?[]:S.extras.slice(); opts.push('확장:'+EXTL[S.ext],'단지:'+cx,'동:'+dong,'표준표 '+TABLE+' · 엔진 '+ENGINE);
    if(!f&&t.corr>0) opts.push('묶음 보정 −'+C.man(t.corr)+'만원');
    var payload={name:v('name'),phone:v('phone'),address:(cx+' '+dong).trim(),spaceType:'아파트',constructionMode:f?'full':'partial',pyeong:String(S.py),rooms:String(S.rooms),baths:String(S.baths),balconies:String(S.balc),
      tier:f?S.grade:t.lines.map(function(l){ return NAME[l.proc]+':'+(l.proc==='발코니'?S.balc+'곳':l.grade); }).join(', '),
      estimatePrice:fmt(t.total),visitDateTime:(v('visitDate')||'')+' '+(v('visitTime')||''),interestedOptions:opts,referralCode:new URLSearchParams(location.search).get('ref')||''};
    var orig=btn.textContent; btn.textContent='전송 중...'; btn.disabled=true; err.textContent='';
    window.BLPost('estimate',payload).then(function(j){
      if(j&&j.ok){ $('#doneSub').textContent=payload.name+'님, 신청 감사해요. '+(v('visitDate')?(v('visitDate')+' '+v('visitTime')+' 방문 희망 일정으로 '):'')+'곧 담당자가 연락드릴게요. 단지명·동으로 평면도를 먼저 확인해 정확한 견적을 준비할게요.';
        S.sent=true; save(); sheet(false); history.replaceState(null,'','#3'); try{ sessionStorage.removeItem(KEY); }catch(x){} guard(); }
      else err.textContent='죄송해요, 잠시 후 다시 시도해주세요.';
    }).catch(function(){ err.textContent='네트워크 오류가 발생했어요. 다시 시도해주세요.'; }).then(function(){ btn.textContent=orig; btn.disabled=false; });
  }); }

  var q=new URLSearchParams(location.search); if(q.get('py')){ var pv=parseInt(q.get('py'),10); if(pv){ S.py=pv; typicalApply(); } }
  typicalApply(); guard();
})();
