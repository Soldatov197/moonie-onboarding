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
