(function () {
    function initPlayer(video) {
        var src = video.getAttribute('data-src');
        var shell = video.closest('[data-player-shell]');
        var playButton = shell ? shell.querySelector('[data-player-play]') : null;
        var hlsInstance = null;

        if (!src) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else {
            video.src = src;
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', function () {
                playVideo();
            });
        }

        video.addEventListener('play', function () {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (playButton && !video.ended) {
                playButton.classList.remove('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (playButton) {
                playButton.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('.hls-player').forEach(initPlayer);
})();
