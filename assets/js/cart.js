/* ============================================================
   cart.js — cart & checkout: qty steppers, remove, coupon,
   step navigation (cart -> checkout -> success)
   Pure Vanilla JS
   ============================================================ */
(function () {
  'use strict';
  window.NEO = window.NEO || {};

  window.NEO.initCart = function () {
    const page = document.querySelector('[data-cart-page]');
    if (!page) return;

    /* convert persian digits to ascii before parsing */
    const toEn = s => (s || '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    const faNum = v => v.toLocaleString('fa-IR');

    let discountRate = 0;
    const steps = Array.from(page.querySelectorAll('.wstep'));
    const panels = Array.from(page.querySelectorAll('.cart-panel'));

    function show(index) {
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === index);
        s.classList.toggle('done', i < index);
      });
      panels.forEach((p, i) => { p.style.display = i === index ? '' : 'none'; });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateTotals() {
      let rent = 0, buy = 0;
      page.querySelectorAll('.cart-item').forEach(item => {
        const qtyEl = item.querySelector('.qty-val');
        const qty = parseInt(toEn(qtyEl && qtyEl.textContent).replace(/[^\d]/g, ''), 10) || 1;
        const price = parseInt(item.dataset.price, 10) || 0;
        if (item.dataset.kind === 'buy') buy += price * qty; else rent += price * qty;
      });
      const discount = Math.round((rent + buy) * discountRate);
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = faNum(v); };
      set('sumRent', rent);
      set('sumBuy', buy);
      set('sumDiscount', discount);
      set('sumTotal', rent + buy - discount);
    }

    /* quantity steppers */
    page.querySelectorAll('.qty-stepper').forEach(stepper => {
      const val = stepper.querySelector('.qty-val');
      const read = () => parseInt(toEn(val.textContent).replace(/[^\d]/g, ''), 10) || 1;
      stepper.querySelector('[data-qty="plus"]').addEventListener('click', () => {
        val.textContent = faNum(read() + 1);
        updateTotals();
      });
      stepper.querySelector('[data-qty="minus"]').addEventListener('click', () => {
        if (read() > 1) { val.textContent = faNum(read() - 1); updateTotals(); }
      });
    });

    /* remove item */
    page.querySelectorAll('.ci-remove').forEach(btn => btn.addEventListener('click', () => {
      btn.closest('.cart-item').remove();
      updateTotals();
      if (!page.querySelector('.cart-item')) {
        const full = page.querySelector('.cart-full');
        const empty = page.querySelector('.cart-empty-wrap');
        if (full) full.style.display = 'none';
        if (empty) empty.style.display = '';
      }
    }));

    /* coupon */
    const couponBtn = page.querySelector('[data-coupon]');
    if (couponBtn) couponBtn.addEventListener('click', () => {
      const input = page.querySelector('.coupon-row input');
      const msg = page.querySelector('.coupon-msg');
      if (!input || !msg) return;
      if (input.value.trim()) {
        discountRate = 0.1;
        msg.textContent = 'کد تخفیف «' + input.value.trim() + '» اعمال شد (۱۰٪ تخفیف).';
        msg.style.color = 'var(--green-dark)';
        updateTotals();
      } else {
        msg.textContent = 'لطفاً کد تخفیف را وارد کنید.';
        msg.style.color = 'var(--crimson)';
      }
    });

    /* payment method selection */
    page.querySelectorAll('.pay-method').forEach(m => m.addEventListener('click', () => {
      page.querySelectorAll('.pay-method').forEach(x => x.classList.remove('active'));
      m.classList.add('active');
    }));

    /* step navigation */
    page.querySelectorAll('[data-cart="next"]').forEach(b => b.addEventListener('click', () => show(1)));
    page.querySelectorAll('[data-cart="back"]').forEach(b => b.addEventListener('click', () => show(0)));
    page.querySelectorAll('[data-cart="submit"]').forEach(b => b.addEventListener('click', () => {
      const form = panels[1];
      if (!form) { show(2); return; }
      const required = Array.from(form.querySelectorAll('[required]'));
      const empty = required.filter(f => !f.value.trim());
      const err = page.querySelector('.cart-error');
      if (empty.length) {
        empty.forEach(f => { f.style.borderColor = 'var(--crimson)'; });
        if (err) err.style.display = '';
        return;
      }
      required.forEach(f => { f.style.borderColor = ''; });
      if (err) err.style.display = 'none';
      show(2);
    }));

    updateTotals();
    show(0);
  };
})();
