const path = require('path');
const express = require('express');
const cfg = require('./config');
const { getContent } = require('./content-store');

function parseCookies(req, _res, next) {
  const header = req.headers.cookie || '';
  req.cookies = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) req.cookies[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  next();
}

// Vern mot CSRF: skriv-operasjonar må kome frå vårt eige opphav
function sameOriginOnly(req, res, next) {
  if (req.method !== 'POST') return next();
  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin) return next(); // eldre nettlesarar utan Origin: slepp gjennom (skjema utan JS)
  try {
    const host = new URL(origin).host;
    if (host === req.headers.host) return next();
  } catch {}
  return res.status(403).send('Ugyldig opphav for forespørselen.');
}

function securityHeaders(req, res, next) {
  res.set({
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.set('Strict-Transport-Security', 'max-age=31536000');
  }
  next();
}

function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.set('view engine', 'ejs');
  app.set('views', path.join(cfg.rootDir, 'views'));
  app.disable('x-powered-by');

  app.use(securityHeaders);
  app.use(parseCookies);
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(sameOriginOnly);

  app.use(
    express.static(path.join(cfg.rootDir, 'public'), {
      // Lang cache i drift (Render set RENDER-miljøvariabelen); ingen cache lokalt
      maxAge: process.env.RENDER ? '30d' : 0,
      immutable: false
    })
  );

  // Felles data og hjelpefunksjonar til alle malar
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  app.use((req, res, next) => {
    const c = getContent();
    res.locals.c = c;
    res.locals.assetV = cfg.assetVersion;
    res.locals.siteUrl = cfg.siteUrl;
    res.locals.sitePublic = cfg.sitePublic;
    res.locals.path = req.path;
    res.locals.nl2br = (s) => esc(s).replace(/\r?\n/g, '<br>');
    res.locals.telHref = (tel) => 'tel:+47' + String(tel).replace(/\D/g, '');
    next();
  });

  app.use('/', require('./routes/public'));
  app.use('/admin', require('./routes/admin'));

  app.use((req, res) => {
    res.status(404).render('404', {
      utanCanonical: true,
      seo: {
        tittel: 'Fant ikke siden – Geir Sandal AS',
        beskriving: 'Siden du lette etter finnes ikke. Gå til forsiden eller kontakt Geir Sandal AS.'
      }
    });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Uventet feil:', err);
    res.status(500).send('Noe gikk galt på serveren. Prøv igjen senere.');
  });

  return app;
}

module.exports = { createApp };
