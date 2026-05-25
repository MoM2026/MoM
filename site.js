/* =====================================================================
   MoM marketing site — shared behaviour
   1. Mobile navigation: injects a hamburger toggle + dropdown panel so
      the nav links stay reachable on small screens.
   2. Scroll reveal: fades content blocks in as they enter the viewport,
      within the brand's animation budget (short, linear, no parallax).
   Both degrade gracefully — if this script never runs, the page stays
   fully visible and the desktop nav is unaffected.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     0 · Inject the styles this script depends on.
     The marketing pages don't share a single stylesheet (the home uses
     inline styles, the others use site.css), so the hamburger/panel and
     reveal rules ship with the script itself. They rely only on the
     design tokens in colors_and_type.css, which every page loads.
     ------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('mom-site-js-styles')) return;
    var css = [
      '.nav__toggle{display:none;}',
      '.nav__panel{display:none;}',
      '.nav__cta,.btn{white-space:nowrap;}',
      '@media (max-width:768px){',
      '.nav{left:12px;right:12px;transform:none;}',
      '.nav__items{display:none;}',
      '.nav__lang{display:none;}',
      '.nav__cta{margin-left:auto;}',
      '.nav__toggle{display:inline-flex;flex-direction:column;justify-content:center;gap:4px;width:40px;height:34px;padding:0 10px;flex:none;margin-left:auto;background:transparent;border:1px solid var(--hairline);border-radius:999px;cursor:pointer;transition:border-color var(--t-base) var(--ease);}',
      '.nav__toggle:hover{border-color:var(--mom-teal);}',
      '.nav__toggle span{display:block;width:100%;height:1.5px;background:var(--fg-1);transition:transform var(--t-base) var(--ease),opacity var(--t-base) var(--ease);}',
      '.nav--open .nav__toggle span:nth-child(1){transform:translateY(5.5px) rotate(45deg);}',
      '.nav--open .nav__toggle span:nth-child(2){opacity:0;}',
      '.nav--open .nav__toggle span:nth-child(3){transform:translateY(-5.5px) rotate(-45deg);}',
      '.nav__panel{position:absolute;top:calc(100% + 10px);left:0;right:0;flex-direction:column;gap:2px;padding:10px;background:rgba(247,246,242,0.97);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--hairline);border-radius:16px;box-shadow:var(--shadow-lift);}',
      '.nav--open .nav__panel{display:flex;}',
      '.nav__panel a{font-family:var(--font-sans);font-size:15px;font-weight:500;color:var(--fg-1);text-decoration:none;padding:12px 16px;border-radius:10px;transition:background var(--t-base) var(--ease),color var(--t-base) var(--ease);}',
      '.nav__panel a:hover,.nav__panel a.is-current{background:var(--paper-soft);color:var(--mom-teal-deep);}',
      '.nav__panel-lang{display:flex;gap:6px;align-items:center;margin-top:6px;padding-top:10px;border-top:1px solid var(--hairline);font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;}',
      '.nav__panel-lang a{padding:8px 14px;border-radius:8px;text-decoration:none;color:var(--fg-3);transition:background var(--t-base) var(--ease),color var(--t-base) var(--ease);}',
      '.nav__panel-lang a:hover{background:var(--paper-soft);}',
      '.nav__panel-lang a.cur{color:var(--mom-teal);}',
      '}',
      'html.reveal-on .reveal{opacity:0;transform:translateY(8px);transition:opacity var(--t-slow) var(--ease),transform var(--t-slow) var(--ease);will-change:opacity,transform;}',
      'html.reveal-on .reveal.is-visible{opacity:1;transform:none;}',
      '@media (prefers-reduced-motion:reduce){html.reveal-on .reveal{opacity:1;transform:none;transition:none;}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'mom-site-js-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------
     1 · Mobile navigation
     ------------------------------------------------------------------ */
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var items = nav.querySelector('.nav__items');
    if (!items) return;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav__toggle';
    toggle.setAttribute('aria-label', 'Apri il menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    var panel = document.createElement('div');
    panel.className = 'nav__panel';

    items.querySelectorAll('a').forEach(function (a) {
      var link = a.cloneNode(true);
      link.removeAttribute('class');
      if (a.classList.contains('is-current')) link.className = 'is-current';
      panel.appendChild(link);
    });

    // The language switch is hidden in the pill on mobile — surface it here.
    var lang = nav.querySelector('.nav__lang');
    if (lang) {
      var langRow = document.createElement('div');
      langRow.className = 'nav__panel-lang';
      lang.querySelectorAll('a').forEach(function (a) {
        var l = a.cloneNode(true);
        l.removeAttribute('style');
        l.className = a.classList.contains('cur') ? 'cur' : '';
        langRow.appendChild(l);
      });
      panel.appendChild(langRow);
    }

    nav.appendChild(toggle);
    nav.appendChild(panel);

    function setOpen(open) {
      nav.classList.toggle('nav--open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('nav--open'));
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     2 · Scroll reveal
     ------------------------------------------------------------------ */
  function initReveal() {
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('reveal-on');

    var selector = [
      'h1', 'h2', 'h3',
      '.section-head',
      '.vert-block__grid > div',
      '.vert-block__media',
      '.ph-hero p', '.page-head__lead', '.page-head__crumbs',
      '.eyebrow',
      'article'
    ].join(', ');

    var candidates = Array.prototype.slice.call(document.querySelectorAll(selector));

    // Keep only the outermost matching element in any nesting chain, so a
    // block and its heading don't animate twice.
    var targets = candidates.filter(function (el) {
      var p = el.parentElement;
      while (p) {
        if (p.matches && p.matches(selector)) return false;
        p = p.parentElement;
      }
      return true;
    });

    targets.forEach(function (el) { el.classList.add('reveal'); });

    // A rAF-throttled scroll check (instead of IntersectionObserver) so that
    // anchor jumps and fast scrolls never leave a block stuck invisible:
    // anything at or above the viewport bottom gets revealed, in DOM order,
    // with a gentle per-batch stagger.
    var pending = targets.slice();
    var ticking = false;

    function reveal() {
      ticking = false;
      var vh = window.innerHeight, batch = [];
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.9) { batch.push(el); return false; }
        return true;
      });
      batch.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 55, 220) + 'ms';
        el.classList.add('is-visible');
      });
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(reveal); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    reveal();
  }

  function init() {
    injectStyles();
    initNav();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
