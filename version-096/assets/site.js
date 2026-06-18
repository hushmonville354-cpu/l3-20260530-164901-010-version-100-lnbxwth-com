(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var mobileToggle = qs('[data-mobile-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  qsa('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || './search.html';
      window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
    });
  });

  var carousel = qs('[data-hero-carousel]');
  if (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var current = 0;
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterRoot = qs('[data-filter-root]');
  if (filterRoot) {
    var keywordInput = qs('[data-filter-keyword]', filterRoot);
    var yearSelect = qs('[data-filter-year]', filterRoot);
    var typeSelect = qs('[data-filter-type]', filterRoot);
    var categorySelect = qs('[data-filter-category]', filterRoot);
    var cards = qsa('[data-movie-card]', filterRoot);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (keywordInput && initial) {
      keywordInput.value = initial;
    }
    function normalize(text) {
      return (text || '').toString().toLowerCase();
    }
    function applyFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value.trim() : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      cards.forEach(function(card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchType = !type || normalize(card.dataset.type).indexOf(normalize(type)) !== -1 || normalize(card.dataset.genre).indexOf(normalize(type)) !== -1;
        var matchCategory = !category || haystack.indexOf(normalize(category)) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType && matchCategory));
      });
    }
    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }
}());
