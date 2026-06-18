document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initImages();
    initSearchPage();
});

function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
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

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (previous) {
        previous.addEventListener("click", function () {
            show(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            start();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function initImages() {
    var images = document.querySelectorAll("img");

    images.forEach(function (image) {
        image.addEventListener("error", function () {
            image.style.opacity = "0";
        }, { once: true });
    });
}

function initSearchPage() {
    var container = document.getElementById("search-results");
    var input = document.querySelector("[data-search-input]");

    if (!container || !input || !window.SEARCH_INDEX) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function card(item) {
        return [
            '<article class="movie-card">',
            '    <a class="poster-wrap" href="' + item.url + '" aria-label="查看 ' + escapeHtml(item.title) + '">',
            '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + ' 封面" loading="lazy">',
            '        <span class="poster-gradient"></span>',
            '        <span class="play-chip">播放</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
            '        <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '        <p>' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(item.year) + '</span>',
            '            <span>' + escapeHtml(item.region) + '</span>',
            '            <span>' + escapeHtml(item.type) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render(query) {
        var cleanQuery = normalize(query);
        var result = window.SEARCH_INDEX;

        if (cleanQuery) {
            result = window.SEARCH_INDEX.filter(function (item) {
                return normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.category,
                    item.tags.join(" "),
                    item.oneLine
                ].join(" ")).indexOf(cleanQuery) !== -1;
            });
        }

        container.innerHTML = result.slice(0, 120).map(card).join("") || '<p class="detail-panel">没有找到匹配的影片，请更换关键词。</p>';
        initImages();
    }

    input.addEventListener("input", function () {
        render(input.value);
    });

    render(initialQuery);
}
