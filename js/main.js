// ===== Language switching (DE default, EN optional) =====
(function () {
  var STORAGE_KEY = 'zr-lang';
  var supported = ['de', 'en'];

  function applyLang(lang) {
    if (supported.indexOf(lang) === -1) lang = 'de';

    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-de]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang) || el.getAttribute('data-de');
      el.innerHTML = text;
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    var saved = 'de';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'de'; } catch (e) {}
    applyLang(saved);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang'));
      });
    });

    // ===== Mobile nav toggle =====
    var navToggle = document.getElementById('navToggle');
    var mainNav = document.getElementById('mainNav');
    if (navToggle && mainNav) {
      navToggle.addEventListener('click', function () {
        mainNav.classList.toggle('open');
      });
      mainNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mainNav.classList.remove('open');
        });
      });
    }

    // ===== "Jetzt buchen" pre-selects room type in booking form =====
    document.querySelectorAll('.room-card .btn[data-room]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var roomSelect = document.getElementById('roomtype');
        if (roomSelect) roomSelect.value = btn.getAttribute('data-room');
      });
    });

    // ===== Scroll-reveal animations =====
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }

    // ===== Hero pinned scroll (intro text -> logo reveal) =====
    (function () {
      var wrapper = document.querySelector('.hero-scroll');
      if (!wrapper) return;

      var info = wrapper.querySelector('.hero-info-layer');
      var logo = wrapper.querySelector('.hero-logo-layer');
      var cue = wrapper.querySelector('.scroll-cue');
      var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) return; // CSS fallback handles the static state

      function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

      function update() {
        var total = wrapper.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var rect = wrapper.getBoundingClientRect();
        var scrolled = -rect.top;
        var progress = clamp(scrolled / total, 0, 1);

        // Phase 1 (0 - 0.45): intro text is visible, fades out as you scroll
        var infoFade = 1 - clamp(progress / 0.45, 0, 1);
        info.style.opacity = infoFade;
        info.style.transform = 'translateY(' + (-progress * 50) + 'px) scale(' + (1 - progress * 0.06) + ')';
        info.style.pointerEvents = infoFade > 0.4 ? 'auto' : 'none';

        // Phase 2 (0.4 - 1): logo zooms in and settles
        var logoFade = clamp((progress - 0.4) / 0.5, 0, 1);
        logo.style.opacity = logoFade;
        logo.style.transform = 'scale(' + (0.55 + logoFade * 0.45) + ')';
        logo.style.pointerEvents = logoFade > 0.5 ? 'auto' : 'none';

        if (cue) cue.style.opacity = 1 - clamp(progress / 0.15, 0, 1);
      }

      var ticking = false;
      function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(function () { update(); ticking = false; });
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', update);
      update();
    })();

    // ===== Scroll-driven zoom (exterior -> interior reveal) =====
    (function () {
      var wrapper = document.querySelector('.zoom-scroll');
      if (!wrapper) return;

      var ext = wrapper.querySelector('.zoom-img-exterior');
      var interior = wrapper.querySelector('.zoom-img-interior');
      var captions = wrapper.querySelectorAll('.zoom-caption-line');
      var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) return; // CSS fallback handles the static state

      function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

      function update() {
        var total = wrapper.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var rect = wrapper.getBoundingClientRect();
        var scrolled = -rect.top;
        var progress = clamp(scrolled / total, 0, 1);

        ext.style.transform = 'scale(' + (1 + progress * 0.7) + ')';

        var fadeStart = 0.45, fadeEnd = 0.95;
        var fade = clamp((progress - fadeStart) / (fadeEnd - fadeStart), 0, 1);
        interior.style.opacity = fade;
        interior.style.transform = 'scale(' + (1.15 - fade * 0.15) + ')';

        captions.forEach(function (line) {
          var phase = line.getAttribute('data-phase');
          var show = phase === '1'
            ? (progress > 0.04 && progress < 0.5)
            : (progress > 0.55);
          line.classList.toggle('active', show);
        });
      }

      var ticking = false;
      function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(function () { update(); ticking = false; });
          ticking = true;
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', update);
      update();
    })();

    // ===== Booking form (static - no backend wired up yet) =====
    var form = document.getElementById('bookingForm');
    var note = document.getElementById('formNote');
    var success = document.getElementById('formSuccess');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        // NOTE: this form is currently static (no backend). To make it
        // functional, send the form data to a server, booking API, or
        // email service here instead of just showing a confirmation.
        if (note) note.hidden = true;
        if (success) success.hidden = false;
        form.reset();
      });
    }
  });
})();
