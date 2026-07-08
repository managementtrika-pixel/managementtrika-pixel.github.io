(()=>{
  function updateLoginState(){
    const current=document.querySelector('.screen.on')?.id;
    const isLogin=current==='login' || !document.querySelector('#home.on,#feed.on,#profile.on,#challenge.on,#feedback.on,#success.on');
    document.body.classList.toggle('login-active',isLogin);
  }
  function observe(){
    const main=document.querySelector('main.app');
    if(!main||main.dataset.authNavWatch)return;
    main.dataset.authNavWatch='1';
    new MutationObserver(updateLoginState).observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{updateLoginState();observe();},120));
  setTimeout(()=>{updateLoginState();observe();},500);
  setTimeout(()=>{updateLoginState();observe();},1300);
  setTimeout(()=>{updateLoginState();observe();},2600);
  window.addEventListener('focus',updateLoginState);
})();
