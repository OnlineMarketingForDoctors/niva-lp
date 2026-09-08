/* Niva Medical Clinic landing page behaviour */
(function () {
  'use strict';

  var SEMBLE_URL = 'https://online-booking.semble.io/?token=fb139c090c61e2f90eb51c33b1a093098f5acf80';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('.header');
  var toTop = document.querySelector('.to-top');
  var menu = document.getElementById('menu');
  var modal = document.getElementById('booking-modal');
  var modalFrame = modal ? modal.querySelector('iframe') : null;
  var lastFocus = null;

  /* Sticky header state + back-to-top visibility */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 24);
    toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* Mobile menu */
  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var first = menu.querySelector('a, button');
    if (first) first.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.addEventListener('click', openMenu); });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Booking modal: every booking button opens the Semble calendar */
  function openBooking(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    if (modalFrame && !modalFrame.getAttribute('src')) modalFrame.setAttribute('src', SEMBLE_URL);
    closeMenu();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var close = modal.querySelector('[data-modal-close]');
    if (close) close.focus();
  }
  function closeBooking() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-book]').forEach(function (b) { b.addEventListener('click', openBooking); });
  modal.querySelectorAll('[data-modal-close]').forEach(function (b) { b.addEventListener('click', closeBooking); });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeBooking(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('is-open')) closeBooking();
    else if (menu.classList.contains('is-open')) closeMenu();
  });

  /* Reveal media on scroll */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Review marquee: duplicate cards once so the loop is seamless */
  if (!reduceMotion) {
    document.querySelectorAll('.marquee-track, .trust-track').forEach(function (track) {
      Array.prototype.slice.call(track.children).forEach(function (c) {
        var clone = c.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });
  }

  /* Placeholder contact form: no backend yet */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      msg.hidden = false;
      msg.textContent = 'Thank you. This form is not connected yet. Please call 020 8865 1938 or use the booking calendar to reach us today.';
      msg.focus();
    });
  }

  /* Opening hours: mark today's row */
  var day = new Date().getDay(); // 0 = Sunday
  var row = document.querySelector('.hours-card tr[data-day="' + day + '"]');
  if (row) {
    var cell = row.querySelector('th');
    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = 'Today';
    cell.appendChild(tag);
  }
})();
