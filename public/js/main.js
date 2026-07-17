// Geir Sandal AS – effektmotor: meny, avsløringar, teljarar, parallakse,
// framdriftslinje og krympande header. Alt fungerer utan JS; dette legg berre
// på finpuss. Ved prefers-reduced-motion blir alt rørsleg slått av.
(function () {
  'use strict';

  var redusertRorsle = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobilmeny (alltid aktiv – ikkje rørsle, berre av/på)
  var knapp = document.querySelector('.meny-knapp');
  var meny = document.getElementById('hovudmeny');
  if (knapp && meny) {
    knapp.addEventListener('click', function () {
      var open = meny.classList.toggle('open');
      knapp.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && meny.classList.contains('open')) {
        meny.classList.remove('open');
        knapp.setAttribute('aria-expanded', 'false');
        knapp.focus();
      }
    });
  }

  if (redusertRorsle || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js');

  // ---------- Avsløringar ved scroll ----------
  var avslorar = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          avslorar.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );
  document.querySelectorAll('.reveal, .prosess-rad').forEach(function (el) {
    avslorar.observe(el);
  });

  // ---------- Teljarar (data-tal="21") ----------
  function tell(el) {
    var mal = parseFloat(el.getAttribute('data-tal'));
    if (isNaN(mal)) return;
    var start = null;
    var tid = 1400;
    function steg(no) {
      if (start === null) start = no;
      var t = Math.min((no - start) / tid, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(mal * eased));
      if (t < 1) requestAnimationFrame(steg);
    }
    requestAnimationFrame(steg);
  }
  var teljar = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tell(entry.target);
          teljar.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll('[data-tal]').forEach(function (el) {
    el.textContent = '0';
    teljar.observe(el);
  });

  // ---------- Framdriftslinje + krympande header + parallakse ----------
  var framdrift = document.querySelector('.framdrift > span');
  var topp = document.querySelector('.hovudtopp');
  var parEl = Array.prototype.slice.call(document.querySelectorAll('[data-par]'));
  var venta = false;

  function oppdater() {
    venta = false;
    var y = window.scrollY;

    if (framdrift) {
      var full = document.documentElement.scrollHeight - window.innerHeight;
      framdrift.style.setProperty('--p', full > 0 ? Math.min(y / full, 1) : 0);
    }
    if (topp) topp.classList.toggle('krympa', y > 24);

    // Parallakse: berre element nær viewporten, klemt til ±60 px
    for (var i = 0; i < parEl.length; i++) {
      var el = parEl[i];
      var fart = parseFloat(el.getAttribute('data-par')) || 0.2;
      var boks = el.getBoundingClientRect();
      if (boks.bottom < -120 || boks.top > window.innerHeight + 120) continue;
      var midt = boks.top + boks.height / 2 - window.innerHeight / 2;
      var flytt = Math.max(-60, Math.min(60, -midt * fart * 0.15));
      el.style.setProperty('--par-y', flytt.toFixed(1) + 'px');
    }
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!venta) {
        venta = true;
        requestAnimationFrame(oppdater);
      }
    },
    { passive: true }
  );
  oppdater();
})();
