(()=>{'use strict';
const cfg=window.OFFBY_CONFIG||{},board=document.getElementById('globalBoard');
if(!board||!cfg.leaderboardEnabled||!/^https:\/\//.test(cfg.apiUrl||'')){board?.classList.add('hidden');return}
const $=id=>document.getElementById(id),today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clientId(){let id=localStorage.getItem('offby_client_id');if(!id){id=crypto.randomUUID();localStorage.setItem('offby_client_id',id)}return id}
function defaultTag(){return 'ANON-'+clientId().replace(/-/g,'').slice(0,4).toUpperCase()}
function cleanTag(v){v=String(v||'').toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,16);return v.length>=3?v:defaultTag()}
function getTag(){return cleanTag(localStorage.getItem('offby_player_tag')||defaultTag())}
function setTag(v){const t=cleanTag(v);localStorage.setItem('offby_player_tag',t);$('playerTag').value=t;return t}
$('playerTag').value=getTag();$('saveTag').onclick=()=>{setTag($('playerTag').value);loadBoard(currentMode())};
function currentMode(){return $('dailyTab')?.classList.contains('active')?'daily':'sprint'}
function challengeDate(mode){if(mode==='daily'){const q=new URLSearchParams(location.search),d=q.get('date');if(/^\d{4}-\d{2}-\d{2}$/.test(d||''))return d}return today()}
function scoreLabel(mode,n){return mode==='sprint'?`${n} ms`:`${n}/100`}
function render(data,mode){
  board.classList.remove('hidden');$('boardTitle').textContent=mode==='sprint'?'Today’s One-Second Board':`Daily Five · ${challengeDate(mode)}`;
  $('globalCount').textContent=Number.isFinite(+data.participants)?data.participants:'—';
  const leaders=Array.isArray(data.leaders)?data.leaders:[];
  $('boardStatus').classList.toggle('hidden',leaders.length>0);
  $('boardStatus').textContent=leaders.length?'':'No scores yet. You could be first.';
  const me=clientId();
  $('leaderRows').innerHTML=leaders.map((r,i)=>`<div class="leader-row ${r.client_id===me?'me':''}"><div class="leader-rank">${i<3?['🥇','🥈','🥉'][i]:'#'+(i+1)}</div><div class="leader-name">${esc(r.player_tag||'ANON')}</div><div class="leader-score">${esc(scoreLabel(mode,r.score))}</div></div>`).join('');
}
async function request(path,opts={}){const res=await fetch(cfg.apiUrl+path,{...opts,headers:{'content-type':'application/json',...(opts.headers||{})}});if(!res.ok)throw new Error(`HTTP ${res.status}`);return res.json()}
async function loadBoard(mode=currentMode()){
  board.classList.remove('hidden');$('boardStatus').classList.remove('hidden');$('boardStatus').textContent='Loading global board…';
  try{const data=await request(`?mode=${encodeURIComponent(mode)}&date=${encodeURIComponent(challengeDate(mode))}`);render(data,mode)}
  catch(e){$('boardStatus').textContent='Global board is temporarily unavailable.';console.warn('OFF BY board',e)}
}
async function submitResult(){
  const mode=currentMode(),score=Number(($('score')?.textContent||'').trim());if(!Number.isFinite(score))return;
  let actualMs=null;if(mode==='sprint'){const m=($('m1')?.textContent||'').match(/\d+/);if(m)actualMs=Number(m[0])}
  try{
    const data=await request('',{method:'POST',body:JSON.stringify({mode,score,actualMs,challengeDate:challengeDate(mode),clientId:clientId(),playerTag:getTag()})});
    render(data,mode);
  }catch(e){console.warn('OFF BY score submit',e);loadBoard(mode)}
}
let wasVisible=false;
const result=$('result');if(result)new MutationObserver(()=>{const visible=!result.classList.contains('hidden');if(visible&&!wasVisible)submitResult();wasVisible=visible}).observe(result,{attributes:true,attributeFilter:['class']});
$('sprintTab')?.addEventListener('click',()=>setTimeout(()=>loadBoard('sprint'),0));$('dailyTab')?.addEventListener('click',()=>setTimeout(()=>loadBoard('daily'),0));
loadBoard(currentMode());
})();
