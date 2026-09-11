(()=>{'use strict';
const coarse=matchMedia('(pointer: coarse)').matches;
if(!coarse)return;
document.documentElement.classList.add('coarse-pointer');
const hold=document.getElementById('hold'),hint=document.querySelector('.hint'),result=document.getElementById('result');
if(hint)hint.textContent='Press and hold · release when it feels right';
function buzz(pattern){try{navigator.vibrate?.(pattern)}catch{}}
if(hold){
  hold.addEventListener('pointerdown',e=>{
    try{hold.setPointerCapture?.(e.pointerId)}catch{}
    document.body.classList.add('timing-active');
    buzz(8);
  });
  const end=()=>{document.body.classList.remove('timing-active');buzz(12)};
  hold.addEventListener('pointerup',end);
  hold.addEventListener('pointercancel',()=>document.body.classList.remove('timing-active'));
  hold.addEventListener('lostpointercapture',()=>document.body.classList.remove('timing-active'));
  hold.addEventListener('contextmenu',e=>e.preventDefault());
}
if(result){
  let wasVisible=!result.classList.contains('hidden');
  new MutationObserver(()=>{
    const visible=!result.classList.contains('hidden');
    if(visible&&!wasVisible){
      buzz([14,24,14]);
      requestAnimationFrame(()=>{
        const card=result.closest('.card');
        card?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      });
    }
    wasVisible=visible;
  }).observe(result,{attributes:true,attributeFilter:['class']});
}
})();
