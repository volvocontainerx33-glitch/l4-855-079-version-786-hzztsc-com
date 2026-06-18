document.addEventListener("DOMContentLoaded", function () {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
        initPlayer(player);
    });
});

function initPlayer(player) {
    var video = player.querySelector("video");
    var cover = player.querySelector("[data-player-start]");
    var source = player.getAttribute("data-source");
    var started = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function hideCover() {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    }

    function attachSource() {
        if (started) {
            return Promise.resolve();
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    if (!video.src) {
                        video.src = source;
                    }
                    resolve();
                });
            });
        }

        video.src = source;
        return Promise.resolve();
    }

    function play() {
        attachSource().then(function () {
            hideCover();
            var playTask = video.play();

            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    video.setAttribute("controls", "controls");
                });
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", hideCover);

    video.addEventListener("ended", function () {
        if (cover) {
            cover.classList.remove("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
