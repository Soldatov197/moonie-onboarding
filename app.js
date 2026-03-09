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


// ---- Audio: sleepy ambient + click sounds ----
let audioCtx=null;
let master=null;
let ambient=null;
let ambientGain=null;
let audioOn=true;

function ensureAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = 0.06;
  master.connect(audioCtx.destination);

  // soft ambient pad
  ambient = audioCtx.createOscillator();
  ambient.type = 'sine';
  ambient.frequency.value = 110;
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 12;

  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = 0.0;

  lfo.connect(lfoGain);
  lfoGain.connect(ambient.frequency);
  ambient.connect(ambientGain);
  ambientGain.connect(master);

  ambient.start();
  lfo.start();

  const now = audioCtx.currentTime;
  ambientGain.gain.cancelScheduledValues(now);
  ambientGain.gain.setValueAtTime(0.0, now);
  ambientGain.gain.linearRampToValueAtTime(0.45, now + 2.5);
}

function clickTone(){
  if(!audioOn) return;
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='triangle';
  o.frequency.setValueAtTime(720, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.07);
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.10);
  o.connect(g); g.connect(master);
  o.start(); o.stop(audioCtx.currentTime + 0.11);
}

function wireAudioButtons(){
  const audioToggle = document.getElementById('audioToggle');
  if(audioToggle){
    audioToggle.addEventListener('click',()=>{
      ensureAudio();
      audioOn = !audioOn;
      master.gain.value = audioOn ? 0.06 : 0.0;
      audioToggle.textContent = audioOn ? '🔊' : '🔈';
      clickTone();
    });
  }

  document.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click',()=>{
      ensureAudio();
      clickTone();
    });
  });

  document.addEventListener('touchstart',()=>{
    ensureAudio();
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }, { once:true });
}

wireAudioButtons();
