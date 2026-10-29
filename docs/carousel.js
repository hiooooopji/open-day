'use strict';
// Adapted from the user's “computer project.html” glass carousel.
const topics = [
  {id:'agent', title:'Agentic AI', icon:'✧', color:'#8cecff', summary:'Give it a goal. Watch an AI observe, plan, use tools, and adapt. Compare the agent with a chatbot.'},
  {id:'training', title:'Scorers & rewards', icon:'◇', color:'#e8c17f', summary:'Deliver the package—or just mark it delivered? Run 20 rounds and see how a reward changes behavior.'},
  {id:'incident', title:'The Hugging Face incident', icon:'⬡', color:'#ff9cbb', summary:'Replay how research agents found a hidden message channel, reached the internet, and crossed the test boundary.'},
  {id:'quantum', title:'Quantum computing', icon:'⎔', color:'#d5a0ff', summary:'Build a qubit state, change its phase, and measure it. See interference change what you get.'},
  {id:'robotics', title:'Robotics', icon:'⚙', color:'#73f0cf', summary:'Give a robot a destination. Place obstacles and watch its sensors, planner, and movement work together.'}
];
const carousel=document.getElementById('carousel');
const dotsEl=document.getElementById('dots');
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
let current=Math.max(0,topics.findIndex(t=>t.id===location.hash.slice(1)));
let touchStart=null,suppressClick=false;
const slides=[],dots=[];
topics.forEach((topic,index)=>{
  const card=document.createElement('a');
  card.className='slide';card.href=`simulations.html#${topic.id}`;
  card.style.setProperty('--accent',topic.color);card.style.setProperty('--glow',topic.color+'18');
  card.setAttribute('aria-label',`${topic.title}: open simulation`);
  card.innerHTML=`<div class="slide-content"><div class="slide-head"><div class="iconbox" aria-hidden="true">${topic.icon}</div></div><h2>${topic.title}</h2><p class="summary">${topic.summary}</p></div><div class="slide-bottom"><div class="explore">Open simulation <span aria-hidden="true">↗</span></div></div>`;
  card.addEventListener('click',event=>{
    if(suppressClick){event.preventDefault();suppressClick=false;return;}
    if(index!==current){event.preventDefault();goTo(index);}
  });
  carousel.append(card);slides.push(card);
  const dot=document.createElement('button');dot.className='dot';dot.setAttribute('aria-label',`Show ${topic.title}`);
  dot.addEventListener('click',()=>goTo(index));dotsEl.append(dot);dots.push(dot);
});
function preview(id,topic){
  const element=document.getElementById(id);element.style.setProperty('--accent',topic.color);
  element.innerHTML=`<div class="mini-icon">${topic.icon}</div><h3>${topic.title}</h3><p>${topic.summary}</p>`;
  element.style.borderColor=topic.color+'30';
}
function render(){
  const n=topics.length;
  slides.forEach((card,index)=>{
    let offset=index-current;if(offset>n/2)offset-=n;if(offset< -n/2)offset+=n;
    const distance=Math.abs(offset);card.classList.toggle('active',offset===0);
    card.style.zIndex=String(20-distance);card.style.opacity=distance===0?'1':distance===1?'.48':'.13';
    card.style.pointerEvents=distance<=1?'auto':'none';card.style.filter=distance===0?'none':'brightness(.62) saturate(.7)';
    card.style.transform=`translateX(${offset*83}%) translateZ(${-distance*240}px) rotateY(${offset*-28}deg) scale(${1-distance*.13})`;
    card.tabIndex=offset===0?0:-1;card.setAttribute('aria-hidden',String(offset!==0));
  });
  dots.forEach((dot,index)=>{dot.classList.toggle('active',index===current);dot.setAttribute('aria-pressed',String(index===current));});
  preview('leftPreview',topics[(current+n-1)%n]);preview('rightPreview',topics[(current+1)%n]);
  document.getElementById('carousel-status').textContent=`${topics[current].title}, topic ${current+1} of ${n}`;
}
function goTo(index){
  const focusWasCard=slides.includes(document.activeElement);current=(index+topics.length)%topics.length;
  history.replaceState(null,'','#'+topics[current].id);render();if(focusWasCard)slides[current].focus({preventScroll:true});
}
document.getElementById('prev').addEventListener('click',()=>goTo(current-1));
document.getElementById('next').addEventListener('click',()=>goTo(current+1));
document.getElementById('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch{document.getElementById('carousel-status').textContent='Fullscreen is unavailable in this browser.';}
});
document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  if(event.key==='ArrowRight'){event.preventDefault();goTo(current+1);}
  if(event.key==='ArrowLeft'){event.preventDefault();goTo(current-1);}
  if(event.key==='Enter'&&!event.target.closest('a,button'))slides[current].click();
});
document.getElementById('app').addEventListener('pointermove',event=>{
  if(reducedMotion.matches||event.pointerType!=='mouse')return;
  const r=event.currentTarget.getBoundingClientRect();
  carousel.style.transform=`rotateX(${-(event.clientY-r.top-r.height/2)/r.height*5}deg) rotateY(${(event.clientX-r.left-r.width/2)/r.width*7}deg)`;
});
document.getElementById('app').addEventListener('pointerleave',()=>{carousel.style.transform='';});
carousel.addEventListener('touchstart',event=>{touchStart={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
carousel.addEventListener('touchend',event=>{
  if(!touchStart)return;
  const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)){suppressClick=true;goTo(current+(dx<0?1:-1));setTimeout(()=>{suppressClick=false;},400);}
  touchStart=null;
},{passive:true});
addEventListener('hashchange',()=>{const index=topics.findIndex(t=>t.id===location.hash.slice(1));if(index>=0){current=index;render();}});
reducedMotion.addEventListener('change',()=>{carousel.style.transform='';});
render();
