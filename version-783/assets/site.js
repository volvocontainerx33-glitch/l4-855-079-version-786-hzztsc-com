(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cardContainer = document.querySelector('[data-card-container]');
    var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));

    if (filterInput && cardContainer) {
        var cards = Array.prototype.slice.call(cardContainer.querySelectorAll('[data-movie-card]'));

        function applyFilter(value) {
            var query = String(value || '').trim().toLowerCase();

            cards.forEach(function (card) {
                var meta = String(card.getAttribute('data-meta') || '').toLowerCase();
                card.classList.toggle('is-hidden', query && meta.indexOf(query) === -1);
            });
        }

        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });

        chipButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                chipButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                filterInput.value = button.getAttribute('data-chip') || '';
                applyFilter(filterInput.value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            filterInput.value = q;
            applyFilter(q);
        }
    }
})();

function initMoviePlayer(videoUrl) {
    var video = document.querySelector('.movie-video');
    var cover = document.querySelector('.player-cover');

    if (!video || !cover || !videoUrl) {
        return;
    }

    var hasLoaded = false;
    var hlsInstance = null;

    function load() {
        if (hasLoaded) {
            return;
        }

        hasLoaded = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function play() {
        load();
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    cover.addEventListener('click', play);

    video.addEventListener('click', function () {
        if (!hasLoaded || video.paused) {
            play();
        } else {
            video.pause();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space' && document.activeElement === document.body) {
            event.preventDefault();
            if (!hasLoaded || video.paused) {
                play();
            } else {
                video.pause();
            }
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
