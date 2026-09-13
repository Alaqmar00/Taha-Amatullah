(function(){
  "use strict";

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
        exact same moment the video starts (browsers always allow
        muted media to autoplay — this is the same rule that lets the
        video itself autoplay). So the music is already running,
        already in sync, already fully buffered in the background,
        from frame one.
     3. Browsers still require one real, direct interaction — a tap,
        a click, or a key press — before they'll let any sound out of
        the speaker. IMPORTANT: scrolling does NOT count for this,
        confirmed against Chromium's and Firefox's own engineering
        docs — only discrete taps/clicks/keys do. So this only listens
        for those genuinely-recognized gestures, not scroll. That part
        is a fixed platform rule with no code workaround, on every
        phone, for every website. But because the track has already
        been playing silently this whole time, the moment a real tap
        happens we don't start it — we just flip mute off. There is no
        fresh network request and no buffering wait at that point, so
        sound appears instantly instead of a few seconds late.
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
