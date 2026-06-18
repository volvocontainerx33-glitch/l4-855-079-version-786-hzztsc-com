(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var strip = document.querySelector('[data-movie-strip]');
    var stripLeft = document.querySelector('[data-strip-left]');
    var stripRight = document.querySelector('[data-strip-right]');

    if (strip && stripLeft && stripRight) {
        stripLeft.addEventListener('click', function () {
            strip.scrollBy({ left: -380, behavior: 'smooth' });
        });
        stripRight.addEventListener('click', function () {
            strip.scrollBy({ left: 380, behavior: 'smooth' });
        });
    }

    var tabRoot = document.querySelector('[data-tabs]');
    if (tabRoot) {
        var tabButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tab-target]'));
        var tabPanels = Array.prototype.slice.call(document.querySelectorAll('[data-tab-panel]'));

        tabButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var target = button.getAttribute('data-tab-target');
                tabButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                tabPanels.forEach(function (panel) {
                    panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === target);
                });
            });
        });
    }

    var searchForm = document.querySelector('[data-search-form]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchSummary = document.querySelector('[data-search-summary]');

    if (searchForm && searchResults && window.MOVIE_SEARCH_DATA) {
        var input = searchForm.querySelector('[data-search-input]');
        var regionSelect = searchForm.querySelector('[data-search-region]');
        var typeSelect = searchForm.querySelector('[data-search-type]');
        var yearSelect = searchForm.querySelector('[data-search-year]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        if (input) {
            input.value = q;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function card(movie) {
            var tagHtml = (movie.tags || []).slice(0, 2).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card movie-card--medium">',
                '    <a class="movie-card__cover" href="' + escapeHtml(movie.href) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\');" />',
                '        <span class="movie-card__badge movie-card__badge--left">' + escapeHtml(movie.region) + '</span>',
                '        <span class="movie-card__badge movie-card__badge--right">' + escapeHtml(movie.type) + '</span>',
                '        <span class="movie-card__play" aria-hidden="true">▶</span>',
                '    </a>',
                '    <div class="movie-card__body">',
                '        <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="movie-card__meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '        <div class="movie-card__tags">' + tagHtml + '</div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function runSearch() {
            var keyword = normalize(input ? input.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var words = keyword.split(/\s+/).filter(Boolean);

            var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                var keywordMatched = words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
                return keywordMatched
                    && (!region || movie.region === region)
                    && (!type || movie.type === type)
                    && (!year || String(movie.year) === String(year));
            }).slice(0, 80);

            searchResults.innerHTML = results.map(card).join('');
            if (searchSummary) {
                searchSummary.textContent = '共找到 ' + results.length + ' 条结果，最多展示前 80 条。';
            }
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });

        [input, regionSelect, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', runSearch);
                element.addEventListener('change', runSearch);
            }
        });

        if (q) {
            runSearch();
        }
    }
})();
