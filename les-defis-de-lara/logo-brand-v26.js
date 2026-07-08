(()=>{
  function logo(className=''){
    const el=document.createElement('div');
    el.className='bylaraWordmark '+className;
    el.innerHTML='<div class="bylaraMain">BY LARA</div><div class="bylaraSub">Coaching</div>';
    return el;
  }
  function add(sectionSelector,targetSelector){
    const section=document.querySelector(sectionSelector);
    if(!section||section.querySelector('.bylaraHeroLogo'))return;
    const target=section.querySelector(targetSelector);
    if(!target)return;
    const mark=logo('bylaraHeroLogo');
    const divider=document.createElement('div');
    divider.className='logoSoftDivider';
    target.insertAdjacentElement('beforebegin',divider);
    divider.insertAdjacentElement('beforebegin',mark);
  }
  function init(){
    add('#login','.tag,#login h1');
    add('#home','.homeHero,.tag,#home h1');
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));
  setTimeout(init,700);
  setTimeout(init,1500);
  setInterval(init,2500);
})();
