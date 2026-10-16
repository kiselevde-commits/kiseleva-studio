/* =========================================================
   Kiseleva — лендинг студии дизайна интерьеров
   Vanilla JS: хедер при скролле, мобильное меню,
   reveal-анимации, фильтр портфолио, слайдер отзывов,
   валидация формы, кнопка "наверх".
   ========================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMobileMenu();
    initReveal();
    initPortfolioFilter();
    initTestimonialSlider();
    initCalculator();
    initContactForm();
    initBackToTop();
  });

  /* -------------------------------------------------------
     1. Хедер: смена фона и цвета при скролле
  ------------------------------------------------------- */
  // Общее состояние темы хедера: 'light' (поверх тёмного hero) / 'dark' (на светлом фоне)
  var headerTheme = {
    apply: null,
    wasScrolled: false,
    menuOpen: false
  };

  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var logo = header.querySelector('[data-header-logo]');
    var navLinks = header.querySelectorAll('[data-header-nav] a');
    var cta = header.querySelector('[data-header-cta]');
    var burgerLines = header.querySelectorAll('[data-burger-line]');
    var inner = header.firstElementChild.firstElementChild; // flex-контейнер

    // scrolled=true => появляется фон хедера. Элементы всегда тёмные (hero светлый)
    function setTheme(light) {
      if (light) {
        header.classList.add('bg-cream/95', 'backdrop-blur-sm', 'border-b', 'border-line');
        if (inner) { inner.classList.remove('h-20', 'md:h-24'); inner.classList.add('h-16', 'md:h-20'); }
      } else {
        header.classList.remove('bg-cream/95', 'backdrop-blur-sm', 'border-b', 'border-line');
        if (inner) { inner.classList.add('h-20', 'md:h-24'); inner.classList.remove('h-16', 'md:h-20'); }
      }
      if (logo) { logo.classList.remove('text-cream'); logo.classList.add('text-ink'); }
      navLinks.forEach(function (a) { a.classList.remove('text-cream/70'); a.classList.add('text-ink/70'); });
      burgerLines.forEach(function (l) { l.classList.remove('bg-cream'); l.classList.add('bg-ink'); });
    }

    headerTheme.apply = setTheme;

    function onScroll() {
      headerTheme.wasScrolled = window.scrollY > 40;
      // Если открыто мобильное меню — всегда светлая тема (menuOpen), иначе по скроллу
      setTheme(headerTheme.menuOpen || headerTheme.wasScrolled);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------
     2. Мобильное меню (бургер)
  ------------------------------------------------------- */
  function initMobileMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    var lines = burger.querySelectorAll('[data-burger-line]');
    var isOpen = false;

    function setOpen(open) {
      isOpen = open;
      headerTheme.menuOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('translate-x-full', !open);

      // Анимация бургера в крестик
      if (open) {
        lines[0].style.transform = 'translateY(6px) rotate(45deg)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'translateY(-6px) rotate(-45deg)';
        document.body.style.overflow = 'hidden';
      } else {
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
        document.body.style.overflow = '';
      }

      // Хедер всегда светлый (тёмные элементы) при открытом меню
      if (headerTheme.apply) {
        headerTheme.apply(open || headerTheme.wasScrolled);
      }
    }

    burger.addEventListener('click', function () { setOpen(!isOpen); });

    // Закрытие при клике по ссылке
    menu.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) setOpen(false);
    });

    // Сброс состояния при переходе на desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && isOpen) setOpen(false);
    });
  }

  /* -------------------------------------------------------
     3. Reveal-анимации при скролле (IntersectionObserver)
  ------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // Применяем кастомную задержку из data-delay
    items.forEach(function (el) {
      var delay = el.getAttribute('data-delay');
      if (delay) el.style.transitionDelay = delay + 'ms';
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* -------------------------------------------------------
     4. Фильтр портфолио
  ------------------------------------------------------- */
  function initPortfolioFilter() {
    var filterWrap = document.getElementById('portfolio-filter');
    var grid = document.getElementById('portfolio-grid');
    if (!filterWrap || !grid) return;

    var buttons = filterWrap.querySelectorAll('.filter-btn');
    var items = grid.querySelectorAll('.portfolio-item');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        // Активное состояние кнопок
        buttons.forEach(function (b) {
          b.classList.remove('text-ink', 'border-accent');
          b.classList.add('text-muted', 'border-transparent');
        });
        btn.classList.add('text-ink', 'border-accent');
        btn.classList.remove('text-muted', 'border-transparent');

        // Показ/скрытие проектов
        items.forEach(function (item) {
          var category = item.getAttribute('data-category');
          var show = (filter === 'all' || filter === category);
          if (show) {
            item.classList.remove('hidden');
            item.style.opacity = '0';
            item.style.transform = 'translateY(16px)';
            // Форсируем перерисовку перед анимацией
            void item.offsetWidth;
            item.style.transition = 'opacity .5s ease, transform .5s ease';
            item.style.opacity = '1';
            item.style.transform = 'none';
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* -------------------------------------------------------
     5. Слайдер отзывов
  ------------------------------------------------------- */
  function initTestimonialSlider() {
    var slides = document.querySelectorAll('.testimonial-slide');
    var dots = document.querySelectorAll('#testimonial-dots .dot');
    if (!slides.length) return;

    var current = 0;
    var timer = null;
    var INTERVAL = 6000;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('opacity-0', i !== current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('bg-accent', i === current);
        dot.classList.toggle('bg-cream/25', i !== current);
      });
    }

    function next() { goTo(current + 1); }

    function start() { stop(); timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.getAttribute('data-dot'), 10));
        start();
      });
    });

    // Пауза при наведении
    var slider = document.getElementById('testimonial-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
    }

    goTo(0);
    start();
  }

  /* -------------------------------------------------------
     6. Калькулятор стоимости проекта
  ------------------------------------------------------- */
  function initCalculator() {
    var range = document.getElementById('calc-range');
    var areaEl = document.getElementById('calc-area');
    var priceEl = document.getElementById('calc-price');
    if (!range || !areaEl || !priceEl) return;

    var RATE = 4500; // ₽ за м²

    function formatNumber(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function update() {
      var area = parseInt(range.value, 10);
      areaEl.textContent = formatNumber(area);
      priceEl.textContent = formatNumber(area * RATE) + ' ₽';
    }

    range.addEventListener('input', update);
    update();
  }

  /* -------------------------------------------------------
     7. Валидация формы (визуальная, без отправки)
  ------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var success = document.getElementById('form-success');

    var rules = {
      name: {
        el: form.querySelector('#name'),
        validate: function (v) { return v.trim().length >= 2; },
        message: 'Укажите имя (минимум 2 символа).'
      },
      phone: {
        el: form.querySelector('#phone'),
        validate: function (v) { return (v.replace(/\D/g, '').length >= 10); },
        message: 'Введите корректный номер телефона.'
      }
    };

    function setError(field, message) {
      var errorEl = form.querySelector('[data-error-for="' + field + '"]');
      var input = rules[field].el;
      if (errorEl) {
        if (message) {
          errorEl.textContent = message;
          errorEl.classList.remove('hidden');
        } else {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
        }
      }
      if (input) {
        input.classList.toggle('border-red-400', !!message);
        input.classList.toggle('border-white/25', !message);
      }
    }

    // Валидация на blur / input
    Object.keys(rules).forEach(function (field) {
      var input = rules[field].el;
      if (!input) return;
      input.addEventListener('blur', function () {
        setError(field, rules[field].validate(input.value) ? '' : rules[field].message);
      });
      input.addEventListener('input', function () {
        if (!form.querySelector('[data-error-for="' + field + '"]').classList.contains('hidden')) {
          setError(field, rules[field].validate(input.value) ? '' : rules[field].message);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      Object.keys(rules).forEach(function (field) {
        var input = rules[field].el;
        var ok = rules[field].validate(input.value);
        setError(field, ok ? '' : rules[field].message);
        if (!ok) valid = false;
      });

      if (!valid) {
        var firstInvalid = form.querySelector('.border-red-400');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Успешная "отправка" без бэкенда
      form.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
      form.querySelectorAll('input, textarea').forEach(function (el) {
        el.classList.remove('border-red-400');
        el.classList.add('border-white/25');
      });
      if (success) {
        success.classList.remove('hidden');
        setTimeout(function () { success.classList.add('hidden'); }, 5000);
      }
    });
  }

  /* -------------------------------------------------------
     8. Кнопка "наверх"
  ------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    function toggle() {
      var show = window.scrollY > 600;
      btn.classList.toggle('opacity-0', !show);
      btn.classList.toggle('pointer-events-none', !show);
      btn.classList.toggle('opacity-100', show);
    }

    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }
})();