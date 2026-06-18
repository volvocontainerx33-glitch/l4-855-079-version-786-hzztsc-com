
(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        if (menuButton) {
            menuButton.addEventListener('click', function () {
                document.body.classList.toggle('nav-open');
            });
        }

        document.querySelectorAll('.mobile-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('nav-open');
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(index + 1);
                }, 5200);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restartTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                restartTimer();
            });
        });

        showSlide(0);
        restartTimer();

        document.querySelectorAll('.search-panel').forEach(function (panel) {
            var input = panel.querySelector('.movie-search');
            var clear = panel.querySelector('.clear-search');
            var scope = panel.parentElement;
            var list = scope ? scope.querySelector('.searchable-list') : null;
            var empty = scope ? scope.querySelector('.empty-state') : null;
            if (!input || !list) {
                return;
            }

            function filterCards() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                list.querySelectorAll('.movie-card').forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    var matched = !value || text.indexOf(value) !== -1;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            input.addEventListener('input', filterCards);
            if (clear) {
                clear.addEventListener('click', function () {
                    input.value = '';
                    filterCards();
                    input.focus();
                });
            }
        });
    });
})();
