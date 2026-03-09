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
let audioOn=true;
let ambientNodes=[];

function ensureAudio(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  master = audioCtx.createGain();
  master.gain.value = 0.18; // louder for phones
  master.connect(audioCtx.destination);

  // soft ambient chord (audible on phone speakers)
  const freqs=[220,277.18,329.63];
  freqs.forEach((f,i)=>{
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.type='sine';
    o.frequency.value=f;
    g.gain.value=0.0001;
    o.connect(g); g.connect(master);
    o.start();
    g.gain.linearRampToValueAtTime(0.035 - i*0.006, audioCtx.currentTime + 1.2);
    ambientNodes.push({o,g});
  });
}

function clickTone(){
  if(!audioOn) return;
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type='square';
  o.frequency.setValueAtTime(900, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.06);
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.22, audioCtx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.09);
  o.connect(g); g.connect(master);
  o.start(); o.stop(audioCtx.currentTime + 0.1);
}

function wireAudioButtons(){
  const audioToggle = document.getElementById('audioToggle');
  if(audioToggle){
    audioToggle.addEventListener('click',()=>{
      ensureAudio();
      if(audioCtx.state === 'suspended') audioCtx.resume();
      audioOn = !audioOn;
      master.gain.value = audioOn ? 0.18 : 0.0;
      audioToggle.textContent = audioOn ? '🔊' : '🔈';
      clickTone();
    });
  }

  document.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click',()=>{
      ensureAudio();
      if(audioCtx.state === 'suspended') audioCtx.resume();
      clickTone();
    });
  });

  // first user gesture unlock
  const unlock = ()=>{
    ensureAudio();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('touchstart', unlock);
  };
  document.addEventListener('pointerdown', unlock, { once:true });
  document.addEventListener('touchstart', unlock, { once:true });
}

wireAudioButtons();
