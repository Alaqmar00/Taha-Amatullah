(function(){
  "use strict";

  var video = document.getElementById('intro-video');
  var videoWrap = document.getElementById('intro-video-wrap');
  var bgm = document.getElementById('bgm');

  function attemptSound(){
    video.muted = false;
    var p = video.play();
    if(p && p.catch){
      p.catch(function(){
        video.muted = true;
        video.play().catch(function(){});
      });
    }
  }
  attemptSound();

  function revealInvitation(){
    videoWrap.classList.add('fade-out');
    bgm.volume = 0.7;
    bgm.play().catch(function(){ /* may need a tap first on some browsers */ });
    setTimeout(function(){ videoWrap.style.display = 'none'; }, 1400);
  }
  video.addEventListener('ended', revealInvitation);
  video.addEventListener('error', revealInvitation);

  /* No mobile browser allows sound to autoplay with zero interaction —
     that's a platform rule, not something any site can override. The
     closest possible thing to "automatic": the very first touch/scroll/
     click ANYWHERE on the page immediately unmutes the video (if it's
     still playing) and starts the music. */
  var unlocked = false;
  function unlockSound(){
    if(unlocked) return;
    unlocked = true;
    if(!video.ended && video.muted){
      video.muted = false;
      video.play().catch(function(){});
    }
    bgm.play().catch(function(){});
  }
  ['touchstart','click','scroll','keydown'].forEach(function(evt){
    document.addEventListener(evt, unlockSound, {once:true, passive:true});
  });

  /* fade cards in on scroll */
  var cards = document.querySelectorAll('.invite-card');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, {threshold:0.15});
    cards.forEach(function(c){ io.observe(c); });
  } else {
    cards.forEach(function(c){ c.classList.add('in-view'); });
  }
})();
