(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = selectAll('.hero-slide');
    if (!slides.length) {
      return;
    }
    var dots = selectAll('.hero-dot');
    var next = document.querySelector('.hero-next');
    var prev = document.querySelector('.hero-prev');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    start();
  }

  function fillFilterOptions(cards, selector, key) {
    var select = document.querySelector(selector);
    if (!select) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || '';
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        return Number(b) - Number(a);
      }
      return a.localeCompare(b, 'zh-Hans-CN');
    });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var lists = selectAll('.js-filter-list');
    if (!lists.length) {
      return;
    }

    lists.forEach(function (list) {
      var cards = selectAll('.movie-card', list);
      var root = list.closest('.content-section') || document;
      var search = root.querySelector('.js-page-search');
      var region = root.querySelector('.js-region-filter');
      var year = root.querySelector('.js-year-filter');
      var sort = root.querySelector('.js-sort-filter');
      var empty = root.querySelector('.empty-state');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (search && query) {
        search.value = query;
      }

      fillFilterOptions(cards, '.js-region-filter', 'data-region');
      fillFilterOptions(cards, '.js-year-filter', 'data-year');

      function applySort() {
        if (!sort || sort.value === 'default') {
          return;
        }
        var sorted = cards.slice().sort(function (a, b) {
          if (sort.value === 'year-desc') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (sort.value === 'year-asc') {
            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
          }
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
        sorted.forEach(function (card) {
          list.appendChild(card);
        });
        cards = sorted;
      }

      function applyFilters() {
        var keyword = normalize(search ? search.value : '');
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var shown = 0;
        applySort();
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var visible = matchKeyword && matchRegion && matchYear;
          card.classList.toggle('is-hidden', !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [search, region, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var trigger = document.getElementById('video-start');
    if (!video || !trigger || !streamUrl) {
      return;
    }
    var hlsInstance = null;

    function attachStream() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
      attachStream();
      trigger.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    trigger.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      trigger.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
