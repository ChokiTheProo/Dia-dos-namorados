// ============================================================
// Kit Dia dos Namorados Perfeito — interações da landing page
// ============================================================

(function () {
  'use strict';

  // ---------- Ano dinâmico no footer ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Contagem regressiva ----------
  // Define um deadline persistente em localStorage (24h a partir da primeira visita).
  // Quando zera, reinicia automaticamente para manter a oferta "viva".
  const STORAGE_KEY  = 'kdn_offer_deadline';
  const COUNTDOWN_MS = 24 * 60 * 60 * 1000;

  function getDeadline() {
    let deadline = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    const now = Date.now();
    if (!deadline || isNaN(deadline) || deadline <= now) {
      deadline = now + COUNTDOWN_MS;
      localStorage.setItem(STORAGE_KEY, String(deadline));
    }
    return deadline;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function format(remaining) {
    const totalSec = Math.max(0, Math.floor(remaining / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return { h, m, s };
  }

  function renderBoxedCountdown(el, t) {
    if (!el) return;
    const boxes = el.querySelectorAll('.cd-box strong');
    if (boxes.length === 3) {
      boxes[0].textContent = pad(t.h);
      boxes[1].textContent = pad(t.m);
      boxes[2].textContent = pad(t.s);
    }
  }

  function renderInlineCountdown(el, t) {
    if (!el) return;
    el.textContent = pad(t.h) + ':' + pad(t.m) + ':' + pad(t.s);
  }

  const offerEl  = document.getElementById('offerCountdown');
  const finalEl  = document.getElementById('finalCountdown');
  const topEl    = document.getElementById('topCountdown');

  let deadline = getDeadline();

  function tick() {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      // Reinicia para manter a oferta sempre ativa
      localStorage.removeItem(STORAGE_KEY);
      deadline = getDeadline();
    }
    const t = format(Math.max(0, deadline - Date.now()));
    renderBoxedCountdown(offerEl, t);
    renderBoxedCountdown(finalEl, t);
    renderInlineCountdown(topEl, t);
  }

  tick();
  setInterval(tick, 1000);

  // ---------- Reveal ao rolar ----------
  if ('IntersectionObserver' in window) {
    const els = document.querySelectorAll(
      '.card, .compare-col, .bonus-card, .offer-card, .guarantee, .faq details, .section-head, .polaroid'
    );
    els.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
  }

  // ---------- Scroll suave para CTAs internos ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ---------- Meta Pixel: InitiateCheckout nos cliques de compra ----------
  document.querySelectorAll('a[href^="https://pay.wiapy.com"]').forEach(a => {
    a.addEventListener('click', () => {
      if (typeof fbq === 'function') {
        fbq('track', 'InitiateCheckout', {
          content_name: 'Kit Dia dos Namorados Perfeito',
          value: 29.90,
          currency: 'BRL'
        });
      }
    });
  });
})();
