/* ==========================================================
   Mojo Marketing — interaction layer
   Vanilla. One shared observer. The page is complete
   and readable if this file never loads.
   ========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(0.16,1,0.3,1)';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  var scrollFns = [], ticking = false;
  function onScroll(fn) { scrollFns.push(fn); fn(); }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      for (var i = 0; i < scrollFns.length; i++) scrollFns[i]();
      ticking = false;
    });
  }, { passive: true });

  function shekel(n) { return '₪' + Math.round(n).toLocaleString('en-US'); }

  /* --- 1. Scroll reveals, 80ms stagger, once only --- */
  var rvs = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var seen = new WeakMap();
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || seen.has(e.target)) return;
        seen.set(e.target, 1);
        var sibs = e.target.parentNode ? $$('.rv', e.target.parentNode) : [];
        e.target.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(e.target)), 6) * 80 + 'ms';
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    rvs.forEach(function (el) { obs.observe(el); });
  }

  /* --- 2. Header, mobile menu, Resources dropdown --- */
  var header = $('#header');
  if (header) onScroll(function () { header.classList.toggle('is-stuck', window.scrollY > 8); });

  var burger = $('#burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var drop = $('#drop'), dropBtn = $('#dropBtn');
  if (drop && dropBtn) {
    dropBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = drop.classList.toggle('is-open');
      dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* --- 3. Videos: show only once the file actually loads, so a
         missing clip leaves the designed fallback in place --- */
  function useVideoWhenReady(video, hideOnSuccess) {
    if (!video) return;
    var src = video.querySelector('source');
    if (!src || !src.getAttribute('src')) return;
    video.addEventListener('loadeddata', function () {
      if (video.videoWidth > 0) {
        video.style.display = 'block';
        if (hideOnSuccess) hideOnSuccess.style.display = 'none';
        var p = video.play(); if (p && p.catch) p.catch(function () {});
      }
    });
    video.addEventListener('error', function () { video.style.display = 'none'; });
    video.load();
  }
  // Spec: static image only on mobile, where the video costs more than it gives.
  var wantsHeroVideo = window.matchMedia('(min-width: 861px)').matches && !reduce;
  if (wantsHeroVideo) useVideoWhenReady($('#heroVideo'), null);
  useVideoWhenReady($('#lvideo'), $('#limg'));

  /* --- 4. Stat counters --- */
  var counters = $$('.count');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cObs.unobserve(e.target);
        var to = parseFloat(e.target.getAttribute('data-to')) || 0, t0 = null;
        (function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 900);
          e.target.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step); else e.target.textContent = to;
        })(performance.now());
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { c.textContent = '0'; cObs.observe(c); });
  }

  /* --- 5. Rotating word --- */
  var rot = $('#rot');
  if (rot && !reduce) {
    var words = $$('span', rot), wi = 0;
    setInterval(function () {
      words[wi].classList.remove('is-on');
      wi = (wi + 1) % words.length;
      words[wi].classList.add('is-on');
    }, 2600);
  }

  /* --- 6. The listing that builds itself --- */
  var lcard = $('#lcard');
  if (lcard && !reduce) {
    var ltitle = $('#ltitle'), ldesc = $('#ldesc'), lbadge = $('#lbadge'),
        lcount = $('#lcount'), chips = $$('.chip', $('#lchips'));
    // Illustrative listings for the demo card. The descriptions describe what
    // is actually in each photograph; the room/size/area line is placeholder
    // copy — swap in the real figures when Mojo supplies them.
    // Illustrative listings for the demo card. The descriptions describe what
    // is actually in each photograph; the room/size/area line is placeholder
    // copy — swap in the real figures when Mojo supplies them.
    var LISTINGS = [
      { img:'assets/photos/photo02.jpg', t:'5 rooms, 118 m², Ramat Beit Shemesh',
        d:'Open kitchen with a terrazzo breakfast table, bright throughout.' },
      { img:'assets/photos/photo03.jpg', t:'5 rooms, 134 m², Old Katamon',
        d:'Marble island, veined splashback, integrated ovens.' },
      { img:'assets/photos/photo04.jpg', t:'4 rooms, 102 m², Rechavia',
        d:'Traditional living room, dark wood and a brick feature wall.' },
      { img:'assets/photos/photo05.jpg', t:'3 rooms, 60 m², Jerusalem',
        d:'Newly renovated. Bright living space opening onto a balcony.' },
      { img:'assets/photos/photo06.jpg', t:'4 rooms, 88 m², Neve Shamir',
        d:'Covered balcony, glass balustrade, courtyard and hills beyond.' }
    ];
    var li = -1, cur = LISTINGS[0];
    var timers = [], visible = true, running = false;
    function clearAll() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function type(el, text, speed, done) {
      var i = 0; el.innerHTML = '<span class="lcard__caret"></span>';
      (function tick() {
        if (!visible) { el.textContent = text; if (done) done(); return; }
        i++;
        el.innerHTML = text.slice(0, i) + (i < text.length ? '<span class="lcard__caret"></span>' : '');
        if (i < text.length) timers.push(setTimeout(tick, speed)); else if (done) done();
      })();
    }
    function reset() {
      lcard.classList.remove('is-good'); lbadge.classList.remove('is-on');
      chips.forEach(function (c) { c.classList.remove('is-on'); });
      ltitle.textContent = 'apartment for sale'; ltitle.style.color = '#7d7d78';
      ldesc.textContent = ''; lcount.textContent = '0';
      li = (li + 1) % LISTINGS.length; cur = LISTINGS[li];
      var im = $('#limg'); if (im) im.src = cur.img;
    }
    function countTo(n, ms) {
      var t0 = null;
      (function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / ms);
        lcount.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }
    function run() {
      if (running) return;
      running = true; reset();
      at(1400, function () { lcard.classList.add('is-good'); });
      at(2300, function () { lbadge.classList.add('is-on'); });
      at(3000, function () {
        ltitle.style.color = '';
        type(ltitle, cur.t, 34, function () { at(250, function () { type(ldesc, cur.d, 18); }); });
      });
      at(6400, function () { chips.forEach(function (c, i) { at(i * 320, function () { c.classList.add('is-on'); }); }); });
      at(8000, function () { countTo(14, 1600); });
      at(11000, function () { running = false; if (visible) run(); });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) { if (!running) run(); } else { clearAll(); running = false; }
      }, { threshold: 0.25 }).observe(lcard);
    } else { run(); }
  }

  /* --- 7. The commission figure climbs with scroll --- */
  var drainFig = $('#drainFig'), cmp = $('#commission');
  if (drainFig) {
    var TARGET = 70800;
    if (reduce || !cmp) { drainFig.textContent = shekel(TARGET); }
    else onScroll(function () {
      var r = cmp.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height * 0.45)));
      drainFig.textContent = shekel(TARGET * p);
    });
  }

  /* --- 8. Campaign path draws itself --- */
  var prog = $('#tlProg') || $('#pathProg'), pathWrap = $('#tl') || $('#path');
  if (prog && pathWrap) {
    var len = prog.getTotalLength();
    prog.style.strokeDasharray = len;
    if (reduce) prog.style.strokeDashoffset = 0;
    else {
      prog.style.strokeDashoffset = len;
      onScroll(function () {
        var r = pathWrap.getBoundingClientRect(), vh = window.innerHeight;
        var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.6)));
        prog.style.strokeDashoffset = len * (1 - p);
      });
    }
  }

  /* --- 9. Commission calculator. 2% + 18% VAT. --- */
  var slider = $('#calcSlider');
  if (slider) {
    var calcVal = $('#calcVal'), outAgent = $('#outAgent'), outKept = $('#outKept');
    var MOJO = 6500, RATE = 0.02, VAT = 1.18;
    var cur = { agent: +slider.value * RATE * VAT, kept: Math.max(0, +slider.value * RATE * VAT - MOJO) };
    function tween(key, to, el) {
      var from = cur[key], t0 = null, dur = reduce ? 0 : 420;
      if (!dur) { cur[key] = to; el.textContent = shekel(to); return; }
      (function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = shekel(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step); else cur[key] = to;
      })(performance.now());
    }
    function update() {
      var v = +slider.value, agent = v * RATE * VAT;
      calcVal.textContent = shekel(v);
      tween('agent', agent, outAgent);
      tween('kept', Math.max(0, agent - MOJO), outKept);
    }
    slider.addEventListener('input', update);
    $$('.preset').forEach(function (b) {
      b.addEventListener('click', function () { slider.value = b.getAttribute('data-v'); update(); });
    });
    update();
  }

  /* --- 10. The M fills with teal as the page scrolls --- */
  var mfill = $('#mfill');
  if (mfill && !reduce) {
    onScroll(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      mfill.style.clipPath = 'inset(' + (100 - p * 100).toFixed(1) + '% 0 0 0)';
    });
  }

  /* --- 11. Sticky consultation bar on mobile --- */
  var bar = $('#stickybar');
  if (bar) onScroll(function () { bar.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.85); });

  /* --- 12. Closing band spotlight --- */
  var spot = $('#spot'), closing = $('.closing');
  if (spot && closing && !reduce && window.matchMedia('(pointer:fine)').matches) {
    closing.addEventListener('pointermove', function (e) {
      var r = closing.getBoundingClientRect();
      spot.style.left = (e.clientX - r.left) + 'px';
      spot.style.top  = (e.clientY - r.top) + 'px';
    });
  }

  /* --- 13. FAQ open animation. details works natively without this. --- */
  if (!reduce) {
    $$('.faq details').forEach(function (d) {
      var body = $('.ans', d);
      if (!body) return;
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        body.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
                     { duration: 250, easing: EASE });
      });
    });
  }

  /* --- 14. Send people to the thank-you page on whichever host the site
         is actually running on, so the form works on the temporary
         .pages.dev address as well as the live domain. --- */
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    $$('input[name="redirect"]').forEach(function (el) {
      el.value = location.origin + '/thank-you.html';
    });
  }

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
