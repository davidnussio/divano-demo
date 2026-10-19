// Divano website: language switch, copy buttons, screenshot shelves, table of contents.
// The language is picked before the first paint by the inline script in each page's <head>.
(function () {
  var root = document.documentElement;

  function setLang(lang, remember) {
    root.dataset.lang = lang;
    root.lang = lang;
    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    // Screenshots exist in both languages: data-shot="…/shots/*/name.webp".
    document.querySelectorAll('img[data-shot]').forEach(function (img) {
      var src = img.getAttribute('data-shot').replace('*', lang);
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    });
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang));
    });
    if (remember) {
      try { localStorage.setItem('divano-lang', lang); } catch (e) { /* private mode: it still switches */ }
    }
  }
  setLang(root.dataset.lang || 'it', false);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set-lang]');
    if (b) setLang(b.getAttribute('data-set-lang'), true);
  });

  // Copy buttons: <button data-copy="text">.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    var text = b.getAttribute('data-copy');
    var done = function () {
      b.classList.add('copied');
      var use = b.querySelector('use');
      if (use) use.setAttribute('href', use.getAttribute('href').replace('#copy', '#check'));
      setTimeout(function () {
        b.classList.remove('copied');
        if (use) use.setAttribute('href', use.getAttribute('href').replace('#check', '#copy'));
      }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
  });

  // Screenshot shelves: a segmented control shows the phone or the TV screens.
  document.querySelectorAll('[data-shelf-switch]').forEach(function (group) {
    var target = document.getElementById(group.getAttribute('data-shelf-switch'));
    group.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-device]');
      if (!b || !target) return;
      var device = b.getAttribute('data-device');
      group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      target.querySelectorAll('[data-device]').forEach(function (s) { s.hidden = s.getAttribute('data-device') !== device; });
      target.scrollLeft = 0;
    });
  });

  // Table of contents: highlight the section being read.
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = byId[entry.target.id];
        if (a) {
          a.classList.add('active');
          if (a.scrollIntoView && window.matchMedia('(max-width: 899px)').matches) {
            a.parentNode.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
          }
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
