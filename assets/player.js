(function () {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('.player-cover');
    var buttons = document.querySelectorAll('[data-play-trigger]');
    var connected = false;
    var hls = null;

    if (!video) {
        return;
    }

    function connect() {
        if (connected) {
            return;
        }
        connected = true;
        var streamUrl = video.getAttribute('data-stream');
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else {
            video.src = streamUrl;
        }
        video.controls = true;
    }

    function playNow(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        connect();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', playNow);
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playNow();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
