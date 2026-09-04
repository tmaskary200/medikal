/* ============================================================
   main.js — shared interactions (header, mega menu, mobile nav,
   accordion, carousel, gallery, sticky bar)
   Pure Vanilla JS — no dependencies
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ---------- Mobile nav drawer ---------- */
  function initMobileNav() {
    const toggle = $('.menu-toggle');
    const nav = $('#mobileNav');
    if (!toggle || !nav) return;
    const close = () => nav.classList.remove('open');
    on(toggle, 'click', () => nav.classList.toggle('open'));
    on($('.mobile-nav-overlay', nav), 'click', close);
    $$('.mn-close', nav).forEach(b => on(b, 'click', close));
    // sub categories accordion
    $$('.mn-cat-toggle', nav).forEach(btn => {
      on(btn, 'click', () => {
        const sub = btn.nextElementSibling;
        const open = sub && sub.style.display === 'block';
        $$('.mn-sub', nav).forEach(s => s.style.display = 'none');
        if (sub) sub.style.display = open ? 'none' : 'block';
        btn.classList.toggle('open', !open);
      });
    });
  }

  /* ---------- 3-Level Mega Menu (desktop) ---------- */
  function initMegaMenu() {
    const triggers = $$('.mega-trigger');
    triggers.forEach(trigger => {
      const wrap = trigger.closest('.mega-wrap');
      if (!wrap) return;
      const mega = $('.mega', wrap);
      let timer;
      on(trigger, 'mouseenter', () => {
        clearTimeout(timer);
        $$('.mega.open').forEach(m => { if (m !== mega) m.classList.remove('open'); });
        mega.classList.add('open');
      });
      on(wrap, 'mouseleave', () => {
        timer = setTimeout(() => mega.classList.remove('open'), 150);
      });
      on(trigger, 'click', (e) => {
        e.preventDefault();
        mega.classList.toggle('open');
      });
      // level 1 -> level 2 panels
      const cats = $$('.mega-cat', mega);
      const panels = $$('.mega-panel', mega);
      cats.forEach((cat, i) => {
        on(cat, 'mouseenter', () => {
          cats.forEach(c => c.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          cat.classList.add('active');
          const panel = panels[i];
          if (panel) panel.classList.add('active');
        });
      });
    });
    // close on escape
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') $$('.mega.open').forEach(m => m.classList.remove('open'));
    });
  }

  /* ---------- FAQ Accordion ---------- */
  function initFAQ() {
    $$('.faq-item').forEach(item => {
      const q = $('.faq-q', item);
      const a = $('.faq-a', item);
      if (!q || !a) return;
      on(q, 'click', () => {
        const isOpen = item.classList.contains('open');
        // close siblings in same list
        const list = item.closest('.faq-list');
        if (list) {
          $$('.faq-item.open', list).forEach(o => {
            o.classList.remove('open');
            const oa = $('.faq-a', o);
            if (oa) oa.style.maxHeight = null;
          });
        }
        if (!isOpen) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------- Testimonials Carousel ---------- */
  function initCarousel() {
    $$('.carousel').forEach(carousel => {
      const track = $('.carousel-track', carousel);
      if (!track) return;
      const prev = $('[data-carousel="prev"]', carousel.closest('section') || document);
      const next = $('[data-carousel="next"]', carousel.closest('section') || document);
      const scrollBy = () => track.firstElementChild ? track.firstElement.clientWidth + 20 : 300;
      on(prev, 'click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
      on(next, 'click', () => track.scrollBy({ left: scrollBy(), behavior: 'smooth' }));
    });
  }

  /* ---------- Product Gallery (thumbs + arrows, smooth fade) ---------- */
  function initGallery() {
    const main = $('#galleryMain');
    if (!main) return;
    const img = $('img', main);
    const thumbs = $$('.gallery-thumb');
    if (!img || !thumbs.length) return;
    let index = 0;
    const srcs = thumbs.map(t => t.dataset.full || (($('img', t) || {}).src || ''));

    function goTo(i) {
      index = (i + srcs.length) % srcs.length;
      thumbs.forEach((t, ti) => t.classList.toggle('active', ti === index));
      main.classList.add('changing');
      setTimeout(() => {
        img.src = srcs[index];
        main.classList.remove('changing');
      }, 200);
    }

    thumbs.forEach((t, ti) => on(t, 'click', () => goTo(ti)));
    on($('[data-gallery="prev"]', main), 'click', () => goTo(index - 1));
    on($('[data-gallery="next"]', main), 'click', () => goTo(index + 1));
  }

  /* ---------- Product Detail Tabs ---------- */
  function initTabs() {
    $$('.pd-tabs').forEach(tabBar => {
      const buttons = $$('button', tabBar);
      const panels = $$('[data-tab-panel]');
      buttons.forEach(btn => {
        on(btn, 'click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          panels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === btn.dataset.tab));
        });
      });
    });
  }

  /* ---------- Buy/Rent toggle on product ---------- */
  function initPriceToggle() {
    const tabs = $$('.pd-tabs-pill');
    if (!tabs.length) return;
    tabs.forEach(btn => {
      on(btn, 'click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        $$('[data-price-mode]').forEach(box => {
          box.style.display = box.dataset.priceMode === mode ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Home rent/buy pill tabs ---------- */
  function initHomeTabs() {
    $$('.tabs-pill').forEach(pill => {
      const buttons = $$('button', pill);
      buttons.forEach(btn => {
        on(btn, 'click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.dataset.target;
          if (target) {
            $$('[data-product-list]').forEach(list => {
              list.style.display = list.dataset.productList === target ? '' : 'none';
            });
          }
        });
      });
    });
  }

  /* ---------- Favorite toggle ---------- */
  function initFav() {
    $$('.pc-fav').forEach(fav => on(fav, 'click', (e) => {
      e.preventDefault();
      fav.classList.toggle('active');
    }));
  }

  /* ---------- Package select ---------- */
  function initPackages() {
    $$('.pkg-card').forEach(card => on(card, 'click', () => {
      const grid = card.closest('.pkg-grid');
      if (grid) $$('.pkg-card', grid).forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    }));
  }

  /* ---------- Sticky bar "submit request" opens wizard ---------- */
  function initStickyBar() {
    $$('.sb-req').forEach(btn => on(btn, 'click', (e) => {
      e.preventDefault();
      const modal = $('#rentalModal');
      if (modal) openModal(modal);
    }));
  }

  /* ---------- Modal helpers (exposed) ---------- */
  window.NEO = window.NEO || {};
  window.NEO.openModal = function (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.NEO.closeModal = function (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };
  function openModal(modal) { window.NEO.openModal(modal); }

  function initModals() {
    $$('[data-open-modal]').forEach(btn => on(btn, 'click', (e) => {
      e.preventDefault();
      const sel = btn.dataset.openModal;
      const modal = $(sel);
      if (modal) openModal(modal);
    }));
    $$('.modal-overlay').forEach(overlay => {
      on(overlay, 'click', (e) => { if (e.target === overlay) window.NEO.closeModal(overlay); });
      $$('.modal-close', overlay).forEach(b => on(b, 'click', () => window.NEO.closeModal(overlay)));
    });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') $$('.modal-overlay.open').forEach(m => window.NEO.closeModal(m));
    });
  }

  /* ---------- Reveal on scroll (soft entrance) ---------- */
  function initReveal() {
    const els = $$('.product-card, .article-card, .cat-card, .why-card, .testimonial-card, .pkg-card, .faq-item, .article-detail, .success-box, .cart-item, .summary-box');
    if (!els.length) return;
    els.forEach(el => el.setAttribute('data-reveal', ''));
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Init all ---------- */
  function init() {
    initMobileNav();
    initMegaMenu();
    initFAQ();
    initCarousel();
    initGallery();
    initTabs();
    initPriceToggle();
    initHomeTabs();
    initFav();
    initReveal();
    initPackages();
    initStickyBar();
    initModals();
    if (window.NEO.initFilters) window.NEO.initFilters();
    if (window.NEO.initWizard) window.NEO.initWizard();
    if (window.NEO.initCart) window.NEO.initCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
