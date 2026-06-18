(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function norm(value) { return String(value || '').toLowerCase(); }

  function setupMenu() {
    const button = qs('[data-menu-toggle]');
    const menu = qs('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', () => menu.classList.toggle('open'));
    menu.addEventListener('click', (event) => {
      if (event.target.matches('a')) menu.classList.remove('open');
    });
  }

  function filterContainer(container, query, chip) {
    if (!container) return 0;
    const items = qsa('[data-card]', container);
    let count = 0;
    const q = norm(query).trim();
    const c = norm(chip).trim();
    items.forEach((item) => {
      const hay = [
        item.dataset.title,
        item.dataset.region,
        item.dataset.type,
        item.dataset.genre,
        item.dataset.tags,
        item.dataset.year,
      ].map(norm).join(' ');
      const okQuery = !q || hay.includes(q);
      const okChip = !c || hay.includes(c);
      const show = okQuery && okChip;
      item.hidden = !show;
      if (show) count += 1;
    });
    return count;
  }

  function setupFilters() {
    const forms = qsa('[data-search-form]');
    forms.forEach((form) => {
      const input = qs('[data-search-input]', form);
      const target = form.dataset.target;
      const container = target ? qs(target) : null;
      const countNode = target ? qs(`[data-result-count="${target}"]`) : null;
      let activeChip = '';
      const chipButtons = qsa('[data-filter-chip]');

      function apply() {
        const count = filterContainer(container, input ? input.value : '', activeChip);
        if (countNode) countNode.textContent = count + ' 条';
      }

      form.addEventListener('submit', (e) => { e.preventDefault(); apply(); });
      if (input) input.addEventListener('input', apply);
      chipButtons.forEach((chip) => {
        chip.addEventListener('click', () => {
          chipButtons.forEach((btn) => btn.classList.remove('active'));
          chip.classList.add('active');
          activeChip = chip.dataset.filterChip || '';
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayer() {
    const video = qs('[data-video-player]');
    const button = qs('[data-play-button]');
    if (!video) return;
    const hlsUrl = video.dataset.hls;
    const mp4Url = video.dataset.mp4;

    function loadMp4() {
      video.src = mp4Url;
    }

    function loadHls() {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) loadMp4();
        });
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        return true;
      }
      loadMp4();
      return false;
    }

    if (!loadHls()) {
      video.addEventListener('error', loadMp4, { once: true });
    }
    if (button) {
      button.addEventListener('click', async () => {
        try {
          await video.play();
          button.style.display = 'none';
        } catch (error) {
          console.warn(error);
        }
      });
    }
    video.addEventListener('play', () => {
      if (button) button.style.display = 'none';
    });
    video.addEventListener('pause', () => {
      if (button) button.style.display = '';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    setupFilters();
    setupPlayer();
  });
})();
