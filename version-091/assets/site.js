(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    let current = 0;
    let timer = null;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }
    }

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', '切换推荐 ' + (index + 1));
        dot.addEventListener('click', function () {
          activate(index);
          if (timer) {
            clearInterval(timer);
          }
          timer = setInterval(function () {
            activate((current + 1) % slides.length);
          }, 5200);
        });
        dotsWrap.appendChild(dot);
      });
      activate(0);
      timer = setInterval(function () {
        activate((current + 1) % slides.length);
      }, 5200);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const cards = Array.from(document.querySelectorAll('[data-search]'));
  const searchCount = document.querySelector('[data-search-count]');

  if (searchInput && cards.length) {
    function filterCards() {
      const value = searchInput.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(function (card) {
        const haystack = (card.getAttribute('data-search') || '').toLowerCase();
        const matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });
      if (searchCount) {
        searchCount.textContent = shown + ' 部';
      }
    }
    searchInput.addEventListener('input', filterCards);
    filterCards();
  }
})();

function initMoviePlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const layer = document.getElementById('playLayer');
  let prepared = false;
  let hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    prepared = true;
  }

  function start() {
    prepare();
    if (layer) {
      layer.classList.add('hidden');
    }
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        if (layer) {
          layer.classList.remove('hidden');
        }
      });
    }
  }

  if (layer) {
    layer.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (layer && !video.ended) {
      layer.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
