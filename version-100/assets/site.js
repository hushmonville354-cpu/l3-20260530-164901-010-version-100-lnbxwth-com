(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                if (input) {
                    input.focus();
                }
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(index);
            if (timer) {
                window.clearInterval(timer);
                timer = null;
                startHero();
            }
        });
    });
    startHero();

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
        var scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.style.display = text.indexOf(query) === -1 ? 'none' : '';
            });
        });
    });

    var searchForm = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    if (searchForm && results && window.MOVIE_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        var searchInput = searchForm.querySelector('input[name="q"]');

        function makeCard(item) {
            var tagHtml = item.tags.slice(0, 3).map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
                '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="poster-shade"></span>',
                '<span class="poster-play">▶</span>',
                '</a>',
                '<div class="card-content">',
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
                '<p>' + escapeHtml(item.oneLine) + '</p>',
                '<div class="tag-row">' + tagHtml + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function runSearch(query) {
            var q = query.trim().toLowerCase();
            var list = window.MOVIE_INDEX;
            if (q) {
                list = list.filter(function (item) {
                    return [item.title, item.year, item.region, item.type, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
                });
            }
            results.innerHTML = list.slice(0, 120).map(makeCard).join('');
        }

        if (searchInput) {
            searchInput.value = initial;
            searchInput.addEventListener('input', function () {
                runSearch(searchInput.value);
            });
        }
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch(searchInput ? searchInput.value : '');
        });
        runSearch(initial);
    }
})();
