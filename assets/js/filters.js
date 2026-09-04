/* ============================================================
   filters.js — archive sidebar: dual price slider + inputs,
   checkboxes, sort, view toggle, live filtering
   Pure Vanilla JS
   ============================================================ */
(function () {
  'use strict';
  window.NEO = window.NEO || {};

  window.NEO.initFilters = function () {
    const sidebar = document.querySelector('.filter-sidebar');
    if (!sidebar) return;

    /* convert persian digits to ascii before parsing */
    const toEn = s => (s || '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

    /* ---------- Dual range price slider ---------- */
    const minInput = document.getElementById('priceMin');
    const maxInput = document.getElementById('priceMax');
    const rangeMin = document.getElementById('rangeMin');
    const rangeMax = document.getElementById('rangeMax');
    const fill = document.querySelector('.range-fill');
    const MIN = parseInt(rangeMin && rangeMin.min, 10) || 0;
    const MAX = parseInt(rangeMin && rangeMax.max, 10) || 10000000;
    const GAP = 100000;

    function setFill() {
      if (!fill || !rangeMin || !rangeMax) return;
      const lo = (rangeMin.value - MIN) / (MAX - MIN) * 100;
      const hi = (rangeMax.value - MIN) / (MAX - MIN) * 100;
      fill.style.right = lo + '%';
      fill.style.width = (hi - lo) + '%';
    }

    function syncFromRange() {
      let lo = parseInt(rangeMin.value, 10);
      let hi = parseInt(rangeMax.value, 10);
      if (hi - lo < GAP) {
        if (this === rangeMin) { lo = hi - GAP; rangeMin.value = lo; }
        else { hi = lo + GAP; rangeMax.value = hi; }
      }
      if (minInput) minInput.value = lo.toLocaleString('fa-IR');
      if (maxInput) maxInput.value = hi.toLocaleString('fa-IR');
      setFill();
      applyFilters();
    }

    function syncFromInput() {
      let lo = parseInt(toEn(minInput.value).replace(/[^\d]/g, ''), 10);
      let hi = parseInt(toEn(maxInput.value).replace(/[^\d]/g, ''), 10);
      if (isNaN(lo)) lo = MIN;
      if (isNaN(hi)) hi = MAX;
      lo = Math.max(MIN, Math.min(lo, MAX - GAP));
      hi = Math.min(MAX, Math.max(hi, lo + GAP));
      rangeMin.value = lo;
      rangeMax.value = hi;
      minInput.value = lo.toLocaleString('fa-IR');
      maxInput.value = hi.toLocaleString('fa-IR');
      setFill();
      applyFilters();
    }

    if (rangeMin && rangeMax) {
      rangeMin.addEventListener('input', syncFromRange);
      rangeMax.addEventListener('input', syncFromRange);
    }
    if (minInput && maxInput) {
      minInput.addEventListener('input', syncFromInput);
      maxInput.addEventListener('input', syncFromInput);
      minInput.addEventListener('blur', syncFromInput);
      maxInput.addEventListener('blur', syncFromInput);
    }
    setFill();

    /* ---------- Sort ---------- */
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

    /* ---------- View toggle ---------- */
    const grid = document.querySelector('.archive-grid');
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      $$('[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (grid) grid.classList.toggle('list-view', btn.dataset.view === 'list');
    }));

    /* ---------- Checkboxes ---------- */
    $$('.filter-block input[type=checkbox]', sidebar).forEach(cb => cb.addEventListener('change', applyFilters));

    /* ---------- Reset ---------- */
    const resetBtn = document.querySelector('.filter-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);

    /* ---------- Mobile filter drawer ---------- */
    const trigger = document.querySelector('.filter-trigger');
    if (trigger) trigger.addEventListener('click', () => sidebar.classList.add('open'));
    const closeBtn = document.querySelector('.filter-close');
    if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    /* ---------- Data ---------- */
    const products = $$('.archive-grid .product-card').map(card => {
      const priceText = ($('.pc-price .price', card) || {}).textContent || '';
      const price = parseInt(toEn(priceText).replace(/[^\d]/g, ''), 10) || 0;
      const oldText = ($('.pc-old', card) || {}).textContent || '';
      const oldPrice = parseInt(toEn(oldText).replace(/[^\d]/g, ''), 10) || 0;
      const dateAttr = card.dataset.date || '0';
      return {
        el: card,
        price,
        oldPrice,
        discount: oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0,
        date: parseInt(dateAttr, 10) || 0,
        category: card.dataset.category || '',
        type: card.dataset.type || '',
        brand: card.dataset.brand || '',
        stock: card.dataset.stock || 'available'
      };
    });

    function applyFilters() {
      const lo = parseInt(toEn(minInput && minInput.value).replace(/[^\d]/g, ''), 10) || MIN;
      const hi = parseInt(toEn(maxInput && maxInput.value).replace(/[^\d]/g, ''), 10) || MAX;
      const checkedCats = checkedValues('category');
      const checkedTypes = checkedValues('type');
      const checkedBrands = checkedValues('brand');
      const checkedStock = checkedValues('stock');
      const sort = sortSelect ? sortSelect.value : 'newest';

      let visible = products.filter(p => {
        if (p.price < lo || p.price > hi) return false;
        if (checkedCats.length && !checkedCats.includes(p.category)) return false;
        if (checkedTypes.length && !checkedTypes.includes(p.type)) return false;
        if (checkedBrands.length && !checkedBrands.includes(p.brand)) return false;
        if (checkedStock.length && !checkedStock.includes(p.stock)) return false;
        return true;
      });

      if (sort === 'newest') visible.sort((a, b) => b.date - a.date);
      else if (sort === 'price-asc') visible.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') visible.sort((a, b) => b.price - a.price);
      else if (sort === 'discount') visible.sort((a, b) => b.discount - a.discount);

      const gridEl = document.querySelector('.archive-grid');
      if (gridEl) {
        products.forEach(p => p.el.remove());
        visible.forEach(p => gridEl.appendChild(p.el));
      }
      const countEl = document.getElementById('resultCount');
      if (countEl) countEl.textContent = visible.length.toLocaleString('fa-IR');
    }

    function checkedValues(name) {
      return $$(`input[data-filter="${name}"]:checked`, sidebar).map(cb => cb.value);
    }

    function resetFilters() {
      $$('.filter-block input[type=checkbox]', sidebar).forEach(cb => cb.checked = false);
      if (rangeMin) rangeMin.value = MIN;
      if (rangeMax) rangeMax.value = MAX;
      if (minInput) minInput.value = MIN.toLocaleString('fa-IR');
      if (maxInput) maxInput.value = MAX.toLocaleString('fa-IR');
      setFill();
      applyFilters();
    }
  };

  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
})();
