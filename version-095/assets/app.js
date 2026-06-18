(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      const open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function restartTimer() {
    if (!slides.length) {
      return;
    }
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5000);
  }

  if (slides.length) {
    showSlide(0);
    restartTimer();
    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        restartTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        restartTimer();
      });
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        restartTimer();
      });
    });
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterType = document.querySelector('[data-filter-type]');
  const filterYear = document.querySelector('[data-filter-year]');
  const cards = Array.from(document.querySelectorAll('.filter-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    const keyword = normalize(filterInput ? filterInput.value : '');
    const typeValue = normalize(filterType ? filterType.value : '');
    const yearValue = normalize(filterYear ? filterYear.value : '');

    cards.forEach(function(card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags
      ].join(' '));
      const typeMatch = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
      const yearMatch = !yearValue || normalize(card.dataset.year) === yearValue;
      const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(typeMatch && yearMatch && keywordMatch));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  if (filterType) {
    filterType.addEventListener('change', applyFilters);
  }
  if (filterYear) {
    filterYear.addEventListener('change', applyFilters);
  }
})();
