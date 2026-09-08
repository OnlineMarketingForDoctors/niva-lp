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

  /* Gallery slider arrows */
  var slider = document.querySelector('.gallery-grid');
  var prevBtn = document.querySelector('[data-slider-prev]');
  var nextBtn = document.querySelector('[data-slider-next]');
  if (slider && prevBtn && nextBtn) {
    function step() { return Math.max(240, slider.clientWidth * 0.8); }
    function updateArrows() {
      prevBtn.disabled = slider.scrollLeft <= 2;
      nextBtn.disabled = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 2;
    }
    prevBtn.addEventListener('click', function () { slider.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    nextBtn.addEventListener('click', function () { slider.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    slider.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  /* Gallery lightbox */
  var lb = document.getElementById('lightbox');
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (lb && links.length && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), current = 0;
    function show(i) {
      current = (i + links.length) % links.length;
      lbImg.src = links[current].getAttribute('href');
      lbImg.alt = links[current].getAttribute('data-caption') || '';
      lbCap.textContent = lbImg.alt;
    }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.showModal(); });
    });
    lb.querySelector('[data-lightbox-close]').addEventListener('click', function () { lb.close(); });
    lb.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
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
