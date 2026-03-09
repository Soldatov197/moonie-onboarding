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

function log(msg){ console.log('[moonie]', msg); }

function setAppHeight(){ appEl.style.height=`${window.innerHeight}px`; }
window.addEventListener('resize', setAppHeight);
setAppHeight();

function drawDots(){
  dots.innerHTML='';
  screens.forEach((_,i)=>{
    const d=document.createElement('div');
    d.className='dot'+(i===index?' active':'');
    dots.appendChild(d);
  });
}

function fade(audio, from, to, ms){
  if(!audio) return;
  const steps=40, dt=ms/steps;
  let k=0;
  audio.volume=from;
  const t=setInterval(()=>{
    k++;
    audio.volume = from + (to-from)*(k/steps);
    if(k>=steps) clearInterval(t);
  }, dt);
}

function hardPlay(a,v=0.001){
  if(!a) return;
  a.volume=v;
  const p=a.play();
  if(p&&p.catch) p.catch(()=>{});
}

function stopAllAudio(){
  [dayAudio,nightAudio].forEach(a=>{ if(a){ a.pause(); a.currentTime=0; } });
}

function setDay(){
  phase='day';
  appEl.classList.add('day');
  appEl.classList.remove('night');
  if(!audioOn) return;
  if(nightAudio){nightAudio.pause(); nightAudio.currentTime=0;}
  hardPlay(dayAudio, 0.01);
  fade(dayAudio, dayAudio?.volume||0.01, 0.85, 4000);
  fade(nightAudio, nightAudio?.volume||0.2, 0.0, 2500);
  setTimeout(()=>nightAudio?.pause(), 2600);
  log('phase=day');
}

function setNight(){
  phase='night';
  appEl.classList.add('night');
  appEl.classList.remove('day');
  if(!audioOn) return;
  if(dayAudio){dayAudio.pause(); dayAudio.currentTime=0;}
  hardPlay(nightAudio, 0.01);
  fade(nightAudio, nightAudio?.volume||0.01, 0.85, 4000);
  fade(dayAudio, dayAudio?.volume||0.2, 0.0, 2500);
  setTimeout(()=>dayAudio?.pause(), 2600);
  log('phase=night');
}

function startCycle(){
  stopCycle();
  setDay();
  cycleTimer=setInterval(()=>{
    if(phase==='day') setNight();
    else setDay();
  }, 30000);
  log('cycle started');
}

function stopCycle(){
  if(cycleTimer){ clearInterval(cycleTimer); cycleTimer=null; }
  appEl.classList.add('night');
  appEl.classList.remove('day');
  stopAllAudio();
}

function showScreen(i){
  screens.forEach((s,idx)=>s.classList.toggle('active', idx===i));
  drawDots();
  if(i===celestialIndex) startCycle();
  else stopCycle();
}

function next(){ index=Math.min(index+1, screens.length-1); showScreen(index); clickTone(); }
function prev(){ index=Math.max(index-1,0); showScreen(index); clickTone(); }
function reset(){ index=0; showScreen(index); clickTone(); }

function unlockAudio(){
  if(dayAudio){ dayAudio.play().then(()=>dayAudio.pause()).catch(()=>{}); }
  if(nightAudio){ nightAudio.play().then(()=>nightAudio.pause()).catch(()=>{}); }
  if(clickAudio){ clickAudio.volume=0.65; }
  log('audio unlocked');
}

function clickTone(){
  if(!audioOn||!clickAudio) return;
  try{ clickAudio.currentTime=0; clickAudio.play().catch(()=>{}); }catch(e){}
}

document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',next));
document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',prev));
document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',reset));
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{c.classList.toggle('active'); clickTone();}));
document.querySelectorAll('.time').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.time').forEach(x=>x.classList.remove('active')); t.classList.add('active'); clickTone();}));

document.getElementById('audioToggle')?.addEventListener('click',()=>{
  audioOn=!audioOn;
  document.getElementById('audioToggle').textContent=audioOn?'🔊':'🔈';
  if(!audioOn) stopAllAudio();
  else if(index===celestialIndex){ phase==='day' ? setDay() : setNight(); }
  clickTone();
  log('audioOn='+audioOn);
});

const firstGesture=()=>{
  unlockAudio();
  document.removeEventListener('touchstart', firstGesture);
  document.removeEventListener('pointerdown', firstGesture);
};
document.addEventListener('touchstart', firstGesture, {once:true});
document.addEventListener('pointerdown', firstGesture, {once:true});

document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
showScreen(index);
