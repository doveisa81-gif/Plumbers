(function () {
  'use strict';

  /* ==========================================================
     CONFIG — edit these two values
     ========================================================== */
  var CITY = 'Your City';
  // Optional: send quote requests to a form service (Formspree, Netlify, your API...).
  // Leave empty to run in demo mode (the form validates but sends nothing).
  var FORM_ENDPOINT = '';

  /* Fill in the city everywhere */
  document.querySelectorAll('[data-city]').forEach(function (el) { el.textContent = CITY; });
  document.title = document.title.replace('Your City', CITY);
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==========================================================
     Mobile navigation
     ========================================================== */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  function setNav(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* Highlight the nav link for the section in view */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[entry.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'services', 'emergency', 'reviews', 'contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ==========================================================
     Testimonials slider
     ========================================================== */
  var track = document.getElementById('slider-track');
  var slides = track.children;
  var dotsWrap = document.getElementById('dots');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var viewport = track.parentElement;
  var index = 0;
  var timer = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
    dot.dataset.index = i;
    dotsWrap.appendChild(dot);
  }

  function goTo(n) {
    index = (n + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    Array.prototype.forEach.call(slides, function (s, k) {
      s.setAttribute('aria-hidden', String(k !== index));
    });
    Array.prototype.forEach.call(dotsWrap.children, function (d, k) {
      if (k === index) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }
  function start() {
    if (reduceMotion) return;
    stop();
    timer = setInterval(function () { goTo(index + 1); }, 6000);
  }
  function stop() { clearInterval(timer); }

  prev.addEventListener('click', function () { goTo(index - 1); start(); });
  next.addEventListener('click', function () { goTo(index + 1); start(); });
  dotsWrap.addEventListener('click', function (e) {
    var d = e.target.closest('.dot');
    if (d) { goTo(Number(d.dataset.index)); start(); }
  });
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', start);

  /* Touch swipe */
  var startX = null;
  viewport.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) goTo(index + (dx < 0 ? 1 : -1));
    startX = null;
    start();
  });
  /* Arrow keys when the slider has focus */
  viewport.parentElement.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { goTo(index - 1); }
    if (e.key === 'ArrowRight') { goTo(index + 1); }
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  goTo(0);
  start();

  /* ==========================================================
     FAQ accordion (one open at a time)
     ========================================================== */
  var faqButtons = document.querySelectorAll('.faq-q');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      faqButtons.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).classList.remove('open');
      });
      if (willOpen) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).classList.add('open');
      }
    });
  });

  /* ==========================================================
     Quote form
     ========================================================== */
  var form = document.getElementById('quote-form');
  var status = form.querySelector('.form-status');

  function setError(input, message) {
    var field = input.closest('.field');
    field.classList.toggle('invalid', !!message);
    field.querySelector('.error').textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate() {
    var ok = true;
    var name = form.elements.name;
    var phone = form.elements.phone;
    var service = form.elements.service;

    if (name.value.trim().length < 2) { setError(name, 'Enter your name.'); ok = false; } else setError(name, '');

    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) { setError(phone, 'Enter a valid phone number.'); ok = false; } else setError(phone, '');

    if (!service.value) { setError(service, 'Choose a service.'); ok = false; } else setError(service, '');

    return ok;
  }

  ['name', 'phone', 'service'].forEach(function (n) {
    form.elements[n].addEventListener('input', function () {
      if (form.elements[n].closest('.field').classList.contains('invalid')) validate();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    if (!validate()) {
      var firstBad = form.querySelector('.invalid input, .invalid select');
      if (firstBad) firstBad.focus();
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    function success() {
      status.classList.add('ok');
      status.textContent = 'Thanks! We\'ll call you within 15 minutes. For an emergency, call (555) 010-0199.';
      form.reset();
    }
    function failure() {
      status.classList.add('fail');
      status.textContent = 'Something went wrong. Please call us at (555) 010-0199.';
    }
    function done() {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }

    if (!FORM_ENDPOINT) {
      /* Demo mode: simulate a successful send */
      setTimeout(function () { success(); done(); }, 600);
      return;
    }

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    }).then(function (res) {
      if (res.ok) success(); else failure();
    }).catch(failure).then(done);
  });
})();
