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
        muted media to autoplay). So the music is already fully
        buffered and ready to go silently while the visitor is still
        looking at the opening screen.
     3. Browsers still require one real, direct interaction — a tap,
        a click, or a key press — before they'll let any sound out of
        the speaker. Tapping "Tap to Open" IS that gesture: it bubbles
        a real click up to the document, which is exactly what the
        listener below is waiting for. Because the track has already
        been playing silently, the moment that tap happens we don't
        start it — we just flip mute off, so sound appears instantly
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
     One tap on the button: starts the video, unmutes the music (via
     the document-level listener above, which this click bubbles
     into), and fades the opening screen out.
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
    }, 1050);
  }
  tapOpenBtn.addEventListener('click', openInvitation);

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

  /* -----------------------------------------------------------------
     Keep the video wrap sized to the ACTUAL visible viewport on
     mobile (100dvh in CSS already handles most modern browsers; this
     is a small fallback for older ones where the address bar
     showing/hiding otherwise leaves odd gaps around the video).
  ----------------------------------------------------------------- */
  function setViewportHeightVar(){
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
  }
  setViewportHeightVar();
  window.addEventListener('resize', setViewportHeightVar);
  window.addEventListener('orientationchange', setViewportHeightVar);

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
