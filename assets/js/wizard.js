/* ============================================================
   wizard.js — 4-step rental request modal
   Pure Vanilla JS
   ============================================================ */
(function () {
  'use strict';
  window.NEO = window.NEO || {};

  window.NEO.initWizard = function () {
    const modal = document.getElementById('rentalModal');
    if (!modal) return;

    const steps = $$('.wstep', modal);
    const panels = $$('.wiz-panel', modal);
    const progressFill = $('.wizard-progress-fill', modal);
    let current = 0;

    function show(index) {
      current = index;
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === index);
        s.classList.toggle('done', i < index);
      });
      panels.forEach((p, i) => p.style.display = i === index ? '' : 'none');
      // back/continue button visibility
      const back = $('[data-wiz="back"]', modal);
      const cont = $('[data-wiz="next"]', modal);
      const submit = $('[data-wiz="submit"]', modal);
      if (back) back.style.display = index === 0 ? 'none' : '';
      if (cont) cont.style.display = index === panels.length - 1 ? 'none' : '';
      if (submit) submit.style.display = index === panels.length - 1 ? '' : 'none';
      modal.scrollTop = 0;
    }

    function next() {
      if (current < panels.length - 1) show(current + 1);
    }
    function back() {
      if (current > 0) show(current - 1);
    }

    on($('[data-wiz="next"]', modal), 'click', next);
    on($('[data-wiz="back"]', modal), 'click', back);

    // selectable cards (single-select groups)
    $$('.select-cards', modal).forEach(group => {
      $$('.select-card', group).forEach(card => on(card, 'click', () => {
        $$('.select-card', group).forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }));
    });
    // radio cards
    $$('.radio-row', modal).forEach(group => {
      $$('.radio-card', group).forEach(card => on(card, 'click', () => {
        $$('.radio-card', group).forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }));
    });

    // reset when modal opens
    const obs = new MutationObserver(() => {
      if (modal.classList.contains('open')) show(0);
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });

    show(0);
  };

  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
})();
