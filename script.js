(function(){
  "use strict";

  var video = document.getElementById('intro-video');
  var videoWrap = document.getElementById('intro-video-wrap');
  var bgm = document.getElementById('bgm');
  bgm.volume = 0.7;

  /* The intro video's own built-in sound stays permanently muted —
     only the one linked background track plays, for the whole site. */
  video.muted = true;

  function revealInvitation(){
    videoWrap.classList.add('fade-out');
    setTimeout(function(){ videoWrap.style.display = 'none'; }, 1400);
  }
  video.addEventListener('ended', revealInvitation);
  video.addEventListener('error', revealInvitation);

  /* No mobile browser allows sound to autoplay with zero interaction —
     that's a platform rule, not something any site can override. The
     closest possible thing to "automatic": the very first touch/scroll/
     click ANYWHERE on the page — even during the video — starts the
     music immediately, so it plays under the video and carries straight
     through into the invitation with no gap or restart. */
  var unlocked = false;
  function unlockSound(){
    if(unlocked) return;
    unlocked = true;
    bgm.play().catch(function(){});
  }
  ['touchstart','click','scroll','keydown'].forEach(function(evt){
    document.addEventListener(evt, unlockSound, {once:true, passive:true});
  });
  /* best-effort: some browsers do allow this to succeed with no gesture at all */
  bgm.play().then(function(){ unlocked = true; }).catch(function(){});

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
