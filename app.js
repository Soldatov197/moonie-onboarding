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


// ---- Audio: sleepy ambient + click sounds (HTMLAudio for iPhone) ----
const bgAudio=document.getElementById('bgAudio');
const clickAudio=document.getElementById('clickAudio');
let audioOn=true;

function unlockAudio(){
  if(!bgAudio||!clickAudio) return;
  bgAudio.volume=0.35;
  clickAudio.volume=0.5;
  bgAudio.play().catch(()=>{});
}

function clickTone(){
  if(!audioOn||!clickAudio) return;
  try{ clickAudio.currentTime=0; clickAudio.play().catch(()=>{}); }catch(e){}
}

function wireAudioButtons(){
  const audioToggle=document.getElementById('audioToggle');
  if(audioToggle){
    audioToggle.addEventListener('click',()=>{
      audioOn=!audioOn;
      audioToggle.textContent=audioOn?'🔊':'🔈';
      if(bgAudio){
        if(audioOn){ bgAudio.play().catch(()=>{}); }
        else { bgAudio.pause(); }
      }
      clickTone();
    });
  }

  document.querySelectorAll('button').forEach(b=>b.addEventListener('click',clickTone));

  const first=()=>{ unlockAudio(); document.removeEventListener('touchstart',first); document.removeEventListener('pointerdown',first); };
  document.addEventListener('touchstart',first,{once:true});
  document.addEventListener('pointerdown',first,{once:true});
}

wireAudioButtons();
