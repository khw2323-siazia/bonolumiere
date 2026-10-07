(function(w){
  'use strict';
  var B=w.BL||{};
  function post(type,data){
    return fetch(B.gas,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({type:type,data:data})}).then(function(r){ return r.json(); });
  }
  w.BLPost=post;
  function today(){ var d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }
  Array.prototype.forEach.call(document.querySelectorAll('input[type=date]'),function(i){ i.min=today(); });
  Array.prototype.forEach.call(document.querySelectorAll('form[data-gas]'),function(f){
    var err=f.querySelector('.err'), btn=f.querySelector('button[type=submit]');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var hp=f.querySelector('[name=website]'); if(hp&&hp.value) return;
      if(!f.reportValidity()) return;
      var data={}, opts=[];
      Array.prototype.forEach.call(f.elements,function(el){
        if(!el.name||el.name==='website'||el.name==='agree'||el.name==='visitDate'||el.name==='visitTime') return;
        if(el.type==='checkbox'){ if(el.checked) opts.push(el.value); return; }
        if(el.type==='radio'&&!el.checked) return;
        data[el.name]=String(el.value||'').trim();
      });
      var vd=f.querySelector('[name=visitDate]'), vt=f.querySelector('[name=visitTime]');
      if(vd||vt) data.visitDateTime=((vd&&vd.value)||'')+' '+((vt&&vt.value)||'');
      if(f.dataset.gas==='estimate'){ data.spaceType='아파트'; data.constructionMode='상담'; data.pyeong=data.pyeong||''; data.rooms='';data.baths='';data.balconies=''; data.tier=''; data.estimatePrice=''; data.interestedOptions=opts; data.referralCode=new URLSearchParams(location.search).get('ref')||''; }
      var orig=btn.textContent; btn.textContent='전송 중...'; btn.disabled=true; err.textContent='';
      post(f.dataset.gas,data).then(function(j){
        if(j&&j.ok){
          var d=document.getElementById(f.dataset.done); if(d){ var code=d.querySelector('.code'); if(code&&j.result&&j.result.code) code.textContent='발급 코드: '+j.result.code; d.classList.add('show'); }
          f.style.display='none';
        } else { err.textContent='죄송해요, 잠시 후 다시 시도해주세요.'; }
      }).catch(function(){ err.textContent='네트워크 오류가 발생했어요. 다시 시도해주세요.'; })
      .then(function(){ btn.textContent=orig; btn.disabled=false; });
    });
  });
})(window);
