const screens=[...document.querySelectorAll('[data-screen]')];
const dots=document.getElementById('dots');
const appEl=document.getElementById('app');
const dayAudio=document.getElementById('dayAudio');
const nightAudio=document.getElementById('nightAudio');
const clickAudio=document.getElementById('clickAudio');
const celestialIndex=2;
let index=0;
let audioOn=true;
let cycleTimer=null;
let phase='day';

function log(msg){
  console.log('[moonie]',msg);
}

function setAppHeight(){ appEl.style.height = `${window.innerHeight}px`; }
window.addEventListener('resize', setAppHeight);
setAppHeight();

function drawDots(){
  dots.innerHTML='';
  screens.forEach((_,i)=>{const d=document.createElement('div');d.className='dot'+(i===index?' active':'');dots.appendChild(d)});
}

function showScreen(i){
  screens.forEach((s,idx)=>s.classList.toggle('active',idx===i));
  drawDots();
  if(i===celestialIndex) startCycle(); else stopCycle();
}

function next(){ index=Math.min(index+1,screens.length-1); showScreen(index); clickTone(); }
function prev(){ index=Math.max(index-1,0); showScreen(index); clickTone(); }
function reset(){ index=0; showScreen(index); clickTone(); }

function stopAllAudio(){
  [dayAudio,nightAudio].forEach(a=>{ if(a){ a.pause(); a.currentTime=0; } });
}

function playDay(){
  appEl.classList.add('day'); appEl.classList.remove('night');
  if(!audioOn) return;
  if(nightAudio) nightAudio.pause();
  if(dayAudio){ dayAudio.currentTime=0; dayAudio.volume=0.8; dayAudio.play().catch(()=>{}); }
  log('phase=day');
}

function playNight(){
  appEl.classList.add('night'); appEl.classList.remove('day');
  if(!audioOn) return;
  if(dayAudio) dayAudio.pause();
  if(nightAudio){ nightAudio.currentTime=0; nightAudio.volume=0.85; nightAudio.play().catch(()=>{}); }
  log('phase=night');
}

function startCycle(){
  stopCycle();
  phase='day';
  playDay();
  cycleTimer=setInterval(()=>{
    if(phase==='day'){ phase='night'; playNight(); }
    else { phase='day'; playDay(); }
  },15000);
  log('cycle started');
}

function stopCycle(){
  if(cycleTimer){ clearInterval(cycleTimer); cycleTimer=null; }
  appEl.classList.add('night'); appEl.classList.remove('day');
  stopAllAudio();
  log('cycle stopped');
}

function unlockAudio(){
  // iOS unlock by user gesture
  if(dayAudio){ dayAudio.play().then(()=>dayAudio.pause()).catch(()=>{}); }
  if(nightAudio){ nightAudio.play().then(()=>nightAudio.pause()).catch(()=>{}); }
  log('audio unlocked');
}

function clickTone(){
  if(!audioOn || !clickAudio) return;
  try{ clickAudio.currentTime=0; clickAudio.volume=0.6; clickAudio.play().catch(()=>{}); }catch(e){}
}

document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',next));
document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',prev));
document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',reset));
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('active')));
document.querySelectorAll('.time').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.time').forEach(x=>x.classList.remove('active'));t.classList.add('active');clickTone();}));

const audioToggle=document.getElementById('audioToggle');
audioToggle?.addEventListener('click',()=>{
  audioOn=!audioOn;
  audioToggle.textContent=audioOn?'🔊':'🔈';
  if(!audioOn){ stopAllAudio(); }
  else if(index===celestialIndex){ phase==='day'?playDay():playNight(); }
  clickTone();
  log('audioOn='+audioOn);
});

const firstGesture=()=>{ unlockAudio(); document.removeEventListener('touchstart',firstGesture); document.removeEventListener('pointerdown',firstGesture); };
document.addEventListener('touchstart',firstGesture,{once:true});
document.addEventListener('pointerdown',firstGesture,{once:true});

document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
showScreen(index);
