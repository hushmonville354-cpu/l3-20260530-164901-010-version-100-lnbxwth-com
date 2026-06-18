(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  document.querySelectorAll('[data-search-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var items = Array.prototype.slice.call(area.querySelectorAll('[data-search-item]'));

    if (!input || !items.length) {
      return;
    }

    input.addEventListener('input', function () {
      var query = normalizeText(input.value);

      items.forEach(function (item) {
        var text = normalizeText(item.getAttribute('data-search-text') || item.textContent);
        item.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-player-trigger]');

    if (!video || !trigger) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hls = null;
    var loaded = false;
    var requestedPlay = false;

    function playVideo() {
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function loadStream() {
      if (loaded || !stream) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();
        if (requestedPlay) {
          playVideo();
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requestedPlay) {
            playVideo();
          }
        });
        return;
      }

      video.src = stream;
      video.load();
      if (requestedPlay) {
        playVideo();
      }
    }

    function startPlayer() {
      requestedPlay = true;
      player.classList.add('is-playing');
      loadStream();
      playVideo();
    }

    trigger.addEventListener('click', startPlayer);

    video.addEventListener('click', function () {
      if (!loaded) {
        startPlayer();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
