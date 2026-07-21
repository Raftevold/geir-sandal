// Admin-forbedringer: dropsone med forhåndsvisning, filfelt-tilbakemelding,
// toasts og mobilmeny. Alt fungerer også uten JS (vanlige skjema).
(function () {
  'use strict';

  // Bekreftelse før destruktive handlinger (CSP tillater ikke inline-JS)
  document.addEventListener('submit', function (e) {
    var msg = e.target.getAttribute('data-confirm');
    if (msg && !window.confirm(msg)) e.preventDefault();
  });

  // Mobilmeny
  var burger = document.querySelector('.a-burger');
  var side = document.querySelector('.a-side');
  if (burger && side) {
    burger.addEventListener('click', function () {
      var open = side.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (side.classList.contains('open') && !side.contains(e.target) && e.target !== burger) {
        side.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Lagret/feil-toast forsvinner av seg selv
  document.querySelectorAll('.a-toast').forEach(function (t) {
    setTimeout(function () {
      t.classList.add('a-toast-skjul');
      setTimeout(function () { t.remove(); }, 500);
    }, 4200);
  });

  // Dropsone: dra-og-slipp + klikk, med forhåndsvisning og alt-tekst per bilde
  document.querySelectorAll('.a-dropsone').forEach(function (sone) {
    var input = sone.querySelector('input[type="file"]');
    var forhand = document.querySelector(sone.getAttribute('data-forhand'));
    if (!input) return;

    function visForhand() {
      if (!forhand) return;
      forhand.innerHTML = '';
      Array.prototype.forEach.call(input.files, function (fil, i) {
        if (!/^image\//.test(fil.type)) return;
        var kort = document.createElement('div');
        kort.className = 'a-forhand-kort';

        var img = document.createElement('img');
        img.alt = '';
        img.src = URL.createObjectURL(fil);
        img.addEventListener('load', function () { URL.revokeObjectURL(img.src); });

        var namn = document.createElement('div');
        namn.className = 'a-fil';
        namn.textContent = fil.name;

        var label = document.createElement('label');
        label.textContent = 'Alt-tekst (hva viser bildet?)';
        label.setAttribute('for', 'alt-ny-' + i);

        var alt = document.createElement('input');
        alt.type = 'text';
        alt.name = 'alt';
        alt.id = 'alt-ny-' + i;
        alt.maxLength = 150;
        alt.placeholder = 'F.eks. Gravemaskin i arbeid på tomt';

        kort.appendChild(img);
        kort.appendChild(namn);
        kort.appendChild(label);
        kort.appendChild(alt);
        forhand.appendChild(kort);
      });
    }

    sone.addEventListener('click', function (e) {
      if (e.target !== input) input.click();
    });
    sone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', visForhand);

    ['dragenter', 'dragover'].forEach(function (ev) {
      sone.addEventListener(ev, function (e) { e.preventDefault(); sone.classList.add('a-dra-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      sone.addEventListener(ev, function (e) { e.preventDefault(); sone.classList.remove('a-dra-over'); });
    });
    sone.addEventListener('drop', function (e) {
      if (!e.dataTransfer || !e.dataTransfer.files.length) return;
      var dt = new DataTransfer();
      Array.prototype.forEach.call(input.files, function (f) { dt.items.add(f); });
      Array.prototype.forEach.call(e.dataTransfer.files, function (f) {
        if (/^image\//.test(f.type)) dt.items.add(f);
      });
      input.files = dt.files;
      visForhand();
    });
  });

  // Direkteopplasting i kontekst: vis valgt fil med miniatyr
  document.querySelectorAll('.a-filfelt').forEach(function (felt) {
    var input = felt.querySelector('input[type="file"]');
    var vald = felt.querySelector('.a-filfelt-vald');
    if (!input || !vald) return;
    input.addEventListener('change', function () {
      vald.innerHTML = '';
      if (!input.files.length) { vald.style.display = 'none'; return; }
      Array.prototype.forEach.call(input.files, function (fil) {
        if (!/^image\//.test(fil.type)) return;
        var img = document.createElement('img');
        img.alt = '';
        img.src = URL.createObjectURL(fil);
        img.addEventListener('load', function () { URL.revokeObjectURL(img.src); });
        vald.appendChild(img);
      });
      var tekst = document.createElement('span');
      tekst.textContent = input.files.length === 1
        ? input.files[0].name + ' lastes opp når du lagrer'
        : input.files.length + ' bilder lastes opp når du lagrer';
      vald.appendChild(tekst);
      vald.style.display = 'block';
    });
  });
})();
