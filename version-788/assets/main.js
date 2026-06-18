(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      menu.hidden = expanded;
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    start();
  }

  function setupHorizontalScroll() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-horizontal-list]'));
    lists.forEach(function (list) {
      var shell = list.closest('.scroll-shell');
      if (!shell) {
        return;
      }
      var left = shell.querySelector('[data-scroll-left]');
      var right = shell.querySelector('[data-scroll-right]');
      function move(direction) {
        list.scrollBy({ left: direction * 420, behavior: 'smooth' });
      }
      if (left) {
        left.addEventListener('click', function () {
          move(-1);
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          move(1);
        });
      }
    });
  }

  function setupTabs() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-category-tab]'));
    if (buttons.length === 0) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-category-tab');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-category-panel]')).forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-category-panel') === name);
        });
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupSearch() {
    var input = document.querySelector('[data-card-search]');
    var list = document.querySelector('[data-card-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var count = document.querySelector('[data-result-count]');
    var type = '';
    function apply() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardType = card.getAttribute('data-type') || '';
        var typeMatched = !type || cardType.indexOf(type) !== -1;
        var matched = (!query || haystack.indexOf(query) !== -1) && typeMatched;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部作品';
      }
    }
    input.addEventListener('input', apply);
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]')).forEach(function (button) {
      button.addEventListener('click', function () {
        type = button.getAttribute('data-filter-type') || '';
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var source = player.getAttribute('data-source');
      var hls = null;
      var loaded = false;
      if (!video || !source) {
        return;
      }
      function load() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1500);
          });
        }
        video.src = source;
        return Promise.resolve();
      }
      function play() {
        load().then(function () {
          player.classList.add('is-playing');
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              player.classList.remove('is-playing');
            });
          }
        });
      }
      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      player.addEventListener('click', function (event) {
        if (event.target === player) {
          play();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupHorizontalScroll();
    setupTabs();
    setupSearch();
    setupPlayers();
  });
})();
