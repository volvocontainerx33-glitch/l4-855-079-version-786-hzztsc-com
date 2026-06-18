(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function setupRails() {
        document.querySelectorAll("[data-movie-rail]").forEach(function (rail) {
            var section = rail.closest("section") || document;
            var left = section.querySelector("[data-rail-left]");
            var right = section.querySelector("[data-rail-right]");
            var step = 420;
            if (left) {
                left.addEventListener("click", function () {
                    rail.scrollBy({ left: -step, behavior: "smooth" });
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    rail.scrollBy({ left: step, behavior: "smooth" });
                });
            }
        });
    }

    function setupSearch() {
        document.querySelectorAll("[data-filter-zone]").forEach(function (zone) {
            var input = zone.querySelector("[data-site-search]");
            var region = zone.querySelector("[data-region-filter]");
            var type = zone.querySelector("[data-type-filter]");
            var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-movie-card]"));
            if (!input && !region && !type) {
                return;
            }

            function norm(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var query = norm(input ? input.value : "");
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                cards.forEach(function (card) {
                    var text = norm(card.getAttribute("data-search"));
                    var sameRegion = !regionValue || card.getAttribute("data-region") === regionValue;
                    var sameType = !typeValue || card.getAttribute("data-type") === typeValue;
                    var sameText = !query || text.indexOf(query) !== -1;
                    card.classList.toggle("is-hidden", !(sameRegion && sameType && sameText));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (type) {
                type.addEventListener("change", apply);
            }
        });
    }

    window.setupMoviePlayer = function (videoId, overlayId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;
        var loaded = false;

        if (!video || !sourceUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            loaded = true;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function start() {
            load();
            hideOverlay();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", hideOverlay);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupRails();
        setupSearch();
    });
})();
