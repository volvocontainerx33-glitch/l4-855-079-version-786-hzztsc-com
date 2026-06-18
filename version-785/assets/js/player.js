function initPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.buttonId);
    var hlsInstance = null;
    var attached = false;

    if (!video || !overlay || !config.url) {
        return;
    }

    function hideOverlay() {
        overlay.classList.add('is-hidden');
    }

    function showOverlay() {
        overlay.classList.remove('is-hidden');
    }

    function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                showOverlay();
            });
        }
    }

    function attachSource() {
        if (attached) {
            hideOverlay();
            playVideo();
            return;
        }
        attached = true;
        hideOverlay();
        video.setAttribute('poster', config.poster || '');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.url;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(config.url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                }
            });
            playVideo();
            return;
        }

        video.src = config.url;
        playVideo();
    }

    overlay.addEventListener('click', attachSource);
    video.addEventListener('click', function () {
        if (!attached) {
            attachSource();
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
