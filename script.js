/**
 * MODULIX — клиентская логика лендинга
 * Vanilla JS без зависимостей: калькулятор, галерея, FAQ, анимации, форма
 */
(function () {
  'use strict';

  /* ==========================================================================
     КОНФИГУРАЦИЯ КАЛЬКУЛЯТОРА (цены в рублях)
     ========================================================================== */
  const PRICES = {
    model: {
      solo: 2790000,
      duo: 4690000
    },
    package: {
      basic: 0,
      comfort: 650000,
      premium: 1200000
    },
    color: {
      white: 0,
      graphite: 150000,
      wood: 250000
    },
    options: {
      terrace: 450000,
      solar: 600000,
      smart: 250000
    }
  };

  /** Превью в калькуляторе при смене модели */
  const MODEL_PREVIEW = {
    solo: {
      src: 'https://cdn.jsdelivr.net/gh/kickfost07-debug/-@main/images/home-1.jpg',
      alt: 'Превью модели SOLO'
    },
    duo: {
      src: 'https://cdn.jsdelivr.net/gh/kickfost07-debug/-@main/images/home-2.jpg',
      alt: 'Превью модели DUO'
    }
  };

  /** Подписи для скрытых полей формы */
  const LABELS = {
    model: { solo: 'SOLO', duo: 'DUO' },
    package: { basic: 'Базовая', comfort: 'Комфорт', premium: 'Премиум' },
    color: { white: 'Белый', graphite: 'Графит', wood: 'Под дерево' },
    options: {
      terrace: 'Терраса',
      solar: 'Солнечные панели',
      smart: 'Умный дом'
    }
  };

  /* ==========================================================================
     DOM-элементы (кэшируем после DOMContentLoaded)
     ========================================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  let calcForm;
  let calcPriceEl;
  let calcProductionEl;
  let calcDeliveryEl;
  let formConfiguration;
  let formPrice;
  let modelSelect;

  /* ==========================================================================
     УТИЛИТЫ
     ========================================================================== */

  /**
   * Форматирование числа в рубли с пробелами-разделителями тысяч
   * @param {number} value
   * @returns {string}
   */
  function formatRubles(value) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(value) + ' ₽';
  }

  /**
   * Чтение текущей конфигурации из формы калькулятора
   * @returns {{ model: string, package: string, color: string, options: string[] }}
   */
  function getCalcState() {
    const model = calcForm.querySelector('input[name="model"]:checked')?.value || 'solo';
    const pkg = calcForm.querySelector('input[name="package"]:checked')?.value || 'basic';
    const color = calcForm.querySelector('input[name="color"]:checked')?.value || 'white';
    const options = $$('input[name="option"]:checked', calcForm).map((el) => el.value);
    return { model, package: pkg, color, options };
  }

  /**
   * Расчёт итоговой стоимости и сроков
   * @param {{ model: string, package: string, color: string, options: string[] }} state
   */
  function calculateTotal(state) {
    let total = PRICES.model[state.model] ?? PRICES.model.solo;
    total += PRICES.package[state.package] ?? 0;
    total += PRICES.color[state.color] ?? 0;

    state.options.forEach((key) => {
      total += PRICES.options[key] ?? 0;
    });

    /* Сроки: DUO и Премиум увеличивают верхнюю границу производства */
    let prodMin = 30;
    let prodMax = 45;
    let delMin = 20;
    let delMax = 35;

    if (state.model === 'duo') {
      prodMax = 50;
      delMax = 40;
    }
    if (state.package === 'premium') {
      prodMin = 35;
      prodMax = 55;
    }
    if (state.options.includes('solar')) {
      prodMax += 5;
    }

    return {
      total,
      production: `${prodMin}–${prodMax} дней`,
      delivery: `${delMin}–${delMax} дней`
    };
  }

  /**
   * Текстовое описание конфигурации для отправки в форме
   */
  function buildConfigurationText(state) {
    const parts = [
      `Модель: ${LABELS.model[state.model]}`,
      `Комплектация: ${LABELS.package[state.package]}`,
      `Цвет: ${LABELS.color[state.color]}`
    ];
    if (state.options.length) {
      parts.push(
        'Опции: ' + state.options.map((o) => LABELS.options[o]).join(', ')
      );
    }
    return parts.join('; ');
  }

  /* ==========================================================================
     КАЛЬКУЛЯТОР — обновление UI с плавной анимацией цены
     ========================================================================== */
  function updateCalculator() {
    const state = getCalcState();
    const { total, production, delivery } = calculateTotal(state);

    if (calcPriceEl) {
      calcPriceEl.classList.add('is-updating');
      calcPriceEl.dataset.price = String(total);

      /* Небольшая задержка для визуального «пересчёта» */
      requestAnimationFrame(() => {
        setTimeout(() => {
          calcPriceEl.textContent = formatRubles(total);
          calcPriceEl.classList.remove('is-updating');
        }, 120);
      });
    }

    if (calcProductionEl) calcProductionEl.textContent = production;
    if (calcDeliveryEl) calcDeliveryEl.textContent = delivery;

    /* Синхронизация с формой заявки */
    if (formConfiguration) {
      formConfiguration.value = buildConfigurationText(state);
    }
    if (formPrice) {
      formPrice.value = formatRubles(total);
    }
    if (modelSelect) {
      modelSelect.value = state.model === 'duo' ? 'duo' : 'solo';
    }

    const previewImg = document.getElementById('calcPreviewImg');
    const preview = MODEL_PREVIEW[state.model];
    if (previewImg && preview) {
      previewImg.src = preview.src;
      previewImg.alt = preview.alt;
    }
  }

  function initCalculator() {
    calcForm = $('#calcForm');
    if (!calcForm) return;

    calcPriceEl = $('#calcPrice');
    calcProductionEl = $('#calcProduction');
    calcDeliveryEl = $('#calcDelivery');
    formConfiguration = $('#formConfiguration');
    formPrice = $('#formPrice');
    modelSelect = $('#modelSelect');

    calcForm.addEventListener('change', updateCalculator);
    calcForm.addEventListener('input', updateCalculator);

    updateCalculator();
  }

  /** Кнопки «Рассчитать SOLO/DUO» на карточках моделей */
  function initModelScrollButtons() {
    $$('[data-scroll-model]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const model = btn.dataset.scrollModel;
        const radio = calcForm?.querySelector(`input[name="model"][value="${model}"]`);
        if (radio) {
          radio.checked = true;
          updateCalculator();
        }
      });
    });
  }

  /* ==========================================================================
     STICKY HEADER — тень при прокрутке
     ========================================================================== */
  function initHeader() {
    const header = $('#header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==========================================================================
     МОБИЛЬНОЕ МЕНЮ
     ========================================================================== */
  function initMobileNav() {
    const toggle = $('#navToggle');
    const nav = $('#mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    /* Закрытие при клике по ссылке */
    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  /* ==========================================================================
     REVEAL — появление секций при скролле (Intersection Observer)
     ========================================================================== */
  function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     ГАЛЕРЕЯ — лайтбокс с клавиатурой и фокус-ловушкой
     ========================================================================== */
  function initGallery() {
    const items = $$('.gallery-item');
    const lightbox = $('#lightbox');
    const img = $('#lightboxImg');
    const btnClose = $('#lightboxClose');
    const btnPrev = $('#lightboxPrev');
    const btnNext = $('#lightboxNext');

    if (!items.length || !lightbox || !img) return;

    /* Полноразмерные URL (w=1400) */
    const fullImages = items.map((item) => {
      const thumb = item.querySelector('img');
      const src = thumb?.src || '';
      return src.replace(/w=\d+/, 'w=1400').replace(/q=\d+/, 'q=90');
    });

    const alts = items.map((item) => item.querySelector('img')?.alt || '');

    let currentIndex = 0;
    let lastFocused = null;

    function show(index) {
      const len = fullImages.length;
      currentIndex = ((index % len) + len) % len;
      img.src = fullImages[currentIndex];
      img.alt = alts[currentIndex];
    }

    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      btnClose?.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      img.src = '';
      lastFocused?.focus();
    }

    items.forEach((item, i) => {
      item.addEventListener('click', () => open(i));
    });

    btnClose?.addEventListener('click', close);
    btnPrev?.addEventListener('click', () => show(currentIndex - 1));
    btnNext?.addEventListener('click', () => show(currentIndex + 1));

    /* Клик по фону закрывает лайтбокс */
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;

      switch (e.key) {
        case 'Escape':
          close();
          break;
        case 'ArrowLeft':
          show(currentIndex - 1);
          break;
        case 'ArrowRight':
          show(currentIndex + 1);
          break;
        default:
          break;
      }
    });
  }

  /* ==========================================================================
     FAQ — аккордеон (один открытый или несколько — здесь несколько)
     ========================================================================== */
  function initFaq() {
    $$('.faq__question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;

        btn.setAttribute('aria-expanded', String(!expanded));

        if (panel) {
          if (expanded) {
            panel.hidden = true;
          } else {
            panel.hidden = false;
          }
        }
      });
    });
  }

  /* ==========================================================================
     ФОРМА ЗАЯВКИ
     Подготовлена для Formspree: замените action на ваш endpoint
     ========================================================================== */
  function initContactForm() {
    const form = $('#contactForm');
    const messageEl = $('#formMessage');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      /* Валидация HTML5 */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn?.textContent;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка…';
      }

      updateCalculator();

      const formData = new FormData(form);
      const action = form.getAttribute('action');

      /*
       * Если action="#" — демо-режим (без бэкенда).
       * Для Formspree: action="https://formspree.io/f/xxxx" method="POST"
       */
      if (!action || action === '#') {
        await new Promise((r) => setTimeout(r, 800));
        showFormMessage(
          messageEl,
          'Спасибо! Заявка принята. Менеджер свяжется с вами в течение 24 часов.',
          'success'
        );
        form.reset();
        if (modelSelect) modelSelect.value = 'solo';
        updateCalculator();
      } else {
        try {
          const res = await fetch(action, {
            method: form.method || 'POST',
            body: formData,
            headers: { Accept: 'application/json' }
          });

          if (res.ok) {
            showFormMessage(messageEl, 'Заявка успешно отправлена!', 'success');
            form.reset();
            updateCalculator();
          } else {
            throw new Error('Ошибка сервера');
          }
        } catch {
          showFormMessage(
            messageEl,
            'Не удалось отправить заявку. Позвоните нам или напишите в WhatsApp.',
            'error'
          );
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || 'Отправить заявку';
      }
    });

    /* Кнопка «Получить каталог PDF» — скролл к форме с пометкой */
    $$('[data-action="catalog"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const comment = $('#comment');
        if (comment && !comment.value.includes('каталог')) {
          comment.value = 'Прошу прислать каталог PDF.';
        }
      });
    });
  }

  function showFormMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message form-message--' + type;
  }

  /* ==========================================================================
     ГОД В ПОДВАЛЕ
     ========================================================================== */
  function initYear() {
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /* ==========================================================================
     ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ DOM
     ========================================================================== */
  function init() {
    initHeader();
    initMobileNav();
    initCalculator();
    initModelScrollButtons();
    initReveal();
    initGallery();
    initFaq();
    initContactForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
