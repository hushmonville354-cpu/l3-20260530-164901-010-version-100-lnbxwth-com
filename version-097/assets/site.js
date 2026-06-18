(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('no-scroll', mobileNav.classList.contains('is-open'));
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var searchCount = document.querySelector('[data-search-count]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function updateSearch(query) {
    var keyword = normalize(query);
    var visible = 0;

    searchCards.forEach(function (card) {
      var terms = normalize(card.getAttribute('data-terms'));
      var matched = !keyword || terms.indexOf(keyword) !== -1;
      card.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (searchCount) {
      searchCount.textContent = keyword ? '找到 ' + visible + ' 部相关影片' : '输入关键词浏览片库内容';
    }
  }

  if (searchInput && searchCards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    updateSearch(initialQuery);

    searchInput.addEventListener('input', function () {
      updateSearch(searchInput.value);
    });

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        updateSearch(searchInput.value);
      });
    }
  }
})();
