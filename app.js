const screens=[...document.querySelectorAll('[data-screen]')];
const dots=document.getElementById('dots');
let index=0;

function setAppHeight(){
  const app=document.getElementById('app');
  app.style.height = `${window.innerHeight}px`;
}
window.addEventListener('resize', setAppHeight);
setAppHeight();

function render(){
  screens.forEach((s,i)=>s.classList.toggle('active',i===index));
  dots.innerHTML='';
  screens.forEach((_,i)=>{const d=document.createElement('div');d.className='dot'+(i===index?' active':'');dots.appendChild(d)});
}
function next(){index=Math.min(index+1,screens.length-1);render();}
function prev(){index=Math.max(index-1,0);render();}
function reset(){index=0;render();}

document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',next));
document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',prev));
document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',reset));
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('active')));
document.querySelectorAll('.time').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.time').forEach(x=>x.classList.remove('active'));t.classList.add('active')}));

document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
render();



// ---- Day/Night cycle + dual music crossfade ----
const appEl=document.getElementById('app');
const dayAudio=document.getElementById('dayAudio');
const nightAudio=document.getElementById('nightAudio');
const clickAudio=document.getElementById('clickAudio');
const celestialIndex=2;
let audioOn=true;
let cycleTimer=null;

function setVolumes(dayV, nightV){
  if(dayAudio) dayAudio.volume=dayV;
  if(nightAudio) nightAudio.volume=nightV;
}

function smoothTo(targetDay, targetNight, ms=2200){
  const steps=24;
  const dt=ms/steps;
  const d0=dayAudio?.volume||0, n0=nightAudio?.volume||0;
  let k=0;
  const t=setInterval(()=>{
    k++;
    const p=k/steps;
    setVolumes(d0 + (targetDay-d0)*p, n0 + (targetNight-n0)*p);
    if(k>=steps) clearInterval(t);
  }, dt);
}

function setDayMode(){
  appEl.classList.add('day'); appEl.classList.remove('night');
  if(audioOn){ smoothTo(0.32,0.0,2500); }
}
function setNightMode(){
  appEl.classList.add('night'); appEl.classList.remove('day');
  if(audioOn){ smoothTo(0.0,0.34,2500); }
}

function startCelestialCycle(){
  stopCelestialCycle();
  setDayMode();
  cycleTimer=setInterval(()=>{
    if(appEl.classList.contains('day')) setNightMode();
    else setDayMode();
  },15000);
}
function stopCelestialCycle(){
  if(cycleTimer){ clearInterval(cycleTimer); cycleTimer=null; }
  appEl.classList.remove('day'); appEl.classList.add('night');
}

// patch render to toggle cycle on moon screen
const _render = render;
render = function(){
  _render();
  if(index===celestialIndex) startCelestialCycle(); else stopCelestialCycle();
};

function unlockAudio(){
  if(dayAudio){dayAudio.play().catch(()=>{}); dayAudio.volume=0;}
  if(nightAudio){nightAudio.play().catch(()=>{}); nightAudio.volume=0;}
  if(clickAudio){clickAudio.volume=0.45;}
  if(index===celestialIndex) setDayMode(); else setNightMode();
}

function clickTone(){
  if(!audioOn||!clickAudio) return;
  try{ clickAudio.currentTime=0; clickAudio.play().catch(()=>{});}catch(e){}
}

function wireAudioButtons(){
  const audioToggle=document.getElementById('audioToggle');
  if(audioToggle){
    audioToggle.addEventListener('click',()=>{
      audioOn=!audioOn;
      audioToggle.textContent=audioOn?'🔊':'🔈';
      if(!audioOn){ setVolumes(0,0); }
      else { if(index===celestialIndex){ appEl.classList.contains('day')?setDayMode():setNightMode(); } else setNightMode(); }
      clickTone();
    });
  }
  document.querySelectorAll('button').forEach(b=>b.addEventListener('click',clickTone));
  const first=()=>{ unlockAudio(); document.removeEventListener('touchstart',first); document.removeEventListener('pointerdown',first); };
  document.addEventListener('touchstart',first,{once:true});
  document.addEventListener('pointerdown',first,{once:true});
}
wireAudioButtons();
render();
