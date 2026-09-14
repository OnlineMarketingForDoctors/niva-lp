/* Niva Medical Clinic landing page behaviour */
(function () {
  'use strict';

  var SEMBLE_ORIGIN = 'https://online-booking.semble.io';
  var SEMBLE_URL = SEMBLE_ORIGIN + '/?token=fb139c090c61e2f90eb51c33b1a093098f5acf80';
  var BOOKING_THANKS_URL = '/thank-you-booking';
  var ENQUIRY_THANKS_URL = '/thank-you-enquiry';
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
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* Mobile menu */
  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var first = menu.querySelector('a, button');
    if (first) first.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.addEventListener('click', openMenu); });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Booking modal: every booking button opens the Semble calendar */
  function openBooking(e) {
    if (e) e.preventDefault();
    if (!modal) return;
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
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-book]').forEach(function (b) { b.addEventListener('click', openBooking); });
  if (modal) {
    modal.querySelectorAll('[data-modal-close]').forEach(function (b) { b.addEventListener('click', closeBooking); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeBooking(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal && modal.classList.contains('is-open')) closeBooking();
    else if (menu && menu.classList.contains('is-open')) closeMenu();
  });

  /* Booking completed: the Semble calendar posts its booking status to this
     page (bookingStatus is "selecting", "selected" or "booked"). Once a
     booking is complete, send the patient to the thank-you page. */
  var bookingDone = false;
  window.addEventListener('message', function (e) {
    if (e.origin !== SEMBLE_ORIGIN || bookingDone) return;
    var data = e.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch (err) { return; } }
    if (data && data.bookingStatus === 'booked') {
      bookingDone = true;
      window.location.assign(BOOKING_THANKS_URL);
    }
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
    document.querySelectorAll('.marquee-track').forEach(function (track) {
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

  /* Contact form: validate, then send the visitor to the thank-you page.
     No backend receives the submission yet; when one is connected, submit
     the data first and redirect on success. */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      window.location.assign(ENQUIRY_THANKS_URL);
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
