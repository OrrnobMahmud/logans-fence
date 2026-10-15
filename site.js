(function () {
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var FROM = { up: 'translateY(40px)', left: 'translateX(-56px)', right: 'translateX(56px)', scale: 'scale(.92)', fade: 'none' };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io, cio, parallax = [];

  function play(el) {
    el.style.opacity = '';
    if (reduce || !el.animate) return;
    var dir = el.getAttribute('data-reveal') || 'up';
    el.animate([{ opacity: 0, transform: FROM[dir] || FROM.up }, { opacity: 1, transform: 'none' }],
      { duration: +el.getAttribute('data-dur') || 950, delay: +el.getAttribute('data-delay') || 0, easing: EASE, fill: 'backwards' });
  }
  function count(el) {
    var target = +el.getAttribute('data-count'), suffix = el.getAttribute('data-suffix') || '', t0 = null;
    if (reduce) return;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function onScroll() {
    var h = innerHeight;
    parallax.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var f = +el.getAttribute('data-parallax') || 0.15;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - h / 2) * -f).toFixed(1) + 'px,0)';
    });
  }
  function scan() {
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); play(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); count(e.target); } });
      }, { threshold: 0.4 });
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
    }
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(function (el) {
      el.setAttribute('data-rv', '1');
      if (reduce) return;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) play(el);
      else { el.style.opacity = '0'; io.observe(el); }
    });
    document.querySelectorAll('[data-count]:not([data-cv])').forEach(function (el) {
      el.setAttribute('data-cv', '1'); cio.observe(el);
    });
    document.querySelectorAll('[data-kenburns]:not([data-kv])').forEach(function (el) {
      el.setAttribute('data-kv', '1');
      if (reduce || !el.animate) return;
      el.animate([{ transform: 'scale(1.14)' }, { transform: 'scale(1.0)' }], { duration: 2600, easing: 'cubic-bezier(.16,.8,.24,1)', fill: 'backwards' })
        .onfinish = function () { el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], { duration: 18000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }); };
    });
    document.querySelectorAll('[data-marquee]:not([data-mv])').forEach(function (el) {
      el.setAttribute('data-mv', '1');
      if (reduce || !el.animate) return;
      el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: +el.getAttribute('data-marquee') || 32000, iterations: Infinity });
    });
    document.querySelectorAll('[data-parallax]:not([data-pv])').forEach(function (el) {
      el.setAttribute('data-pv', '1'); if (!reduce) parallax.push(el);
    });
    onScroll();
  }
  // Links use clean URLs (/services). When previewing raw files (no Netlify rewrites), map them back.
  var MAP = { '/': 'index.html', '/services': 'Services.dc.html', '/gallery': 'Gallery.dc.html', '/about': 'About.dc.html', '/reviews': 'Reviews.dc.html', '/contact': 'Contact.dc.html' };
  if (/\.html$/.test(location.pathname) || location.protocol === 'file:') {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="/"]');
      if (!a) return;
      var parts = a.getAttribute('href').split('#'), file = MAP[parts[0]];
      if (!file) return;
      e.preventDefault();
      location.href = file + (parts[1] ? '#' + parts[1] : '');
    }, true);
  }
  window.LF = {
    init: function () {
      scan(); [250, 800, 1800, 3500].forEach(function (t) { setTimeout(scan, t); });
      // Safety net: never leave content hidden if the observer can't fire.
      setTimeout(function () {
        if (document.hidden || !('IntersectionObserver' in window)) {
          document.querySelectorAll('[data-rv]').forEach(function (el) { el.style.opacity = ''; });
        }
      }, 4000);
    },
    rescan: scan,
    submit: function (formName, data) {
      var body = new URLSearchParams(Object.assign({ 'form-name': formName }, data)).toString();
      return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; });
    }
  };
})();
