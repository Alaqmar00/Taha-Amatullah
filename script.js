(function(){
  "use strict";

  var openingScreen = document.getElementById('opening-screen');
  var tapOpenBtn     = document.getElementById('tap-open-btn');
  var video      = document.getElementById('intro-video');
  var videoWrap  = document.getElementById('intro-video-wrap');
  var bgm        = document.getElementById('bgm');
  var scrollHint = document.getElementById('scroll-hint');

  bgm.volume = 0.7;

  /* -----------------------------------------------------------------
     SOUND STRATEGY
     -------------------------------------------------------------------
     1. The intro video's OWN built-in audio track is permanently
        muted (video.muted = true, and never changed) — it never plays,
        by design.
     2. The linked background track starts muted+autoplaying at the
        exact same moment the page loads (browsers always allow
        muted media to autoplay — this is the same rule that lets
        muted video autoplay). So the music is already fully
        buffered and ready to go silently, from frame one, while the
        visitor is still looking at the opening screen.
     3. Browsers still require one real, direct interaction — a tap,
        a click, or a key press — before they'll let any sound out of
        the speaker. The "Tap to Open" button IS that gesture: tapping
        it bubbles a real click up to the document, which is exactly
        what the listener below is waiting for. Because the track has
        already been playing silently, the moment that tap happens we
        don't start it — we just flip mute off. There is no fresh
        network request and no buffering wait at that point, so sound
        appears instantly instead of a few seconds late, and it opens
        in the very same gesture that starts the video.
  ----------------------------------------------------------------- */

  video.muted = true;
  bgm.muted = true;
  bgm.play().catch(function(){ /* will retry via the events below if this is blocked */ });

  function unmuteMusic(){
    bgm.muted = false;
    if(bgm.paused){ bgm.play().catch(function(){}); }
  }
  ['touchstart','touchend','pointerdown','mousedown','click','keydown'].forEach(function(evt){
    document.addEventListener(evt, unmuteMusic, {once:true, passive:true});
  });

  /* -----------------------------------------------------------------
     OPENING SCREEN -> INTRO VIDEO HANDOFF
     One tap: unmutes the music (via the document-level listener
     above, which this same click bubbles into), starts the intro
     video playing, and fades/zooms the opening screen away.
  ----------------------------------------------------------------- */
  var opened = false;
  function openInvitation(){
    if(opened) return;
    opened = true;

    var playPromise = video.play();
    if(playPromise && playPromise.catch){ playPromise.catch(function(){}); }

    openingScreen.classList.add('opening-hide');
    setTimeout(function(){
      openingScreen.style.display = 'none';
    }, 1200);
  }
  openingScreen.addEventListener('click', openInvitation);
  tapOpenBtn.addEventListener('click', openInvitation);
  tapOpenBtn.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openInvitation(); }
  });

  /* -----------------------------------------------------------------
     VIDEO -> INVITATION HANDOFF
  ----------------------------------------------------------------- */
  function revealInvitation(){
    videoWrap.classList.add('fade-out');
    setTimeout(function(){
      videoWrap.style.display = 'none';
      showScrollHint();
    }, 1400);
  }
  video.addEventListener('ended', revealInvitation);
  video.addEventListener('error', revealInvitation);

  function showScrollHint(){
    scrollHint.classList.add('show');
    setTimeout(function(){ scrollHint.classList.remove('show'); }, 2000);
  }

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
