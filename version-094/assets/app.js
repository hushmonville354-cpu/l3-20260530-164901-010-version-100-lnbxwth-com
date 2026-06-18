(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function clean(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.hidden = !menu.hidden;
    });
  }

  function setupHero() {
    var slides = $all('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    var dots = $all('[data-slide-to]');
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var prev = $('[data-slide-prev]');
    var next = $('[data-slide-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        restart();
      });
    });
    restart();
  }

  function setupSearch() {
    var input = $('#globalSearch');
    var panel = $('#searchPanel');
    var list = window.SITE_SEARCH_INDEX || [];
    if (!input || !panel || !list.length) {
      return;
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
      }
      var hits = list.filter(function (item) {
        return (item.title + ' ' + item.meta + ' ' + item.tags).toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 16);
      if (!hits.length) {
        panel.hidden = false;
        panel.innerHTML = '<span class="search-result"><strong>暂无匹配影片</strong><span>可以更换关键词继续搜索</span></span>';
        return;
      }
      panel.hidden = false;
      panel.innerHTML = hits.map(function (item) {
        return '<a class="search-result" href="./' + clean(item.url) + '"><strong>' + clean(item.title) + '</strong><span>' + clean(item.meta) + '</span></a>';
      }).join('');
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var first = $('.search-result[href]', panel);
        if (first) {
          event.preventDefault();
          window.location.href = first.getAttribute('href');
        }
      }
    });
    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.hidden = true;
      }
    });
  }

  function setupCardTools() {
    var search = $('[data-card-search]');
    var sort = $('[data-card-sort]');
    var grid = $('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = $all('.movie-card, .ranking-item', grid);

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.hidden = keyword && haystack.indexOf(keyword) === -1;
      });
      if (sort && sort.value !== 'default') {
        var sorted = cards.slice().sort(function (a, b) {
          if (sort.value === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          }
          var av = Number(a.getAttribute('data-' + sort.value)) || 0;
          var bv = Number(b.getAttribute('data-' + sort.value)) || 0;
          return bv - av;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    if (sort) {
      sort.addEventListener('change', apply);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupCardTools();
  });
})();
