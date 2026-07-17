# Nettside for Geir Sandal AS

Moderne nettside med innebygd admin/CMS for Geir Sandal AS, maskinentreprenør i
Deknepollen ved Måløy (org.nr 978 620 779).

## Teknologi

- **Node.js + Express + EJS** – server-rendrede sider, ingen byggesteg
- **Ren CSS/JS, selvhostet Manrope-font** – ingen tredjepartsavhengigheter i
  nettleseren, ingen cookies på offentlige sider
- **Admin på /admin** – passordbeskyttet; all tekst, bilder, tjenester,
  prosjekter, SEO og varsellinje kan endres uten kode
- **Lagring i prioritert rekkefølge:** Postgres (`DATABASE_URL`) → GitHub API
  (`GITHUB_TOKEN` + `GITHUB_REPO`, egen gren `innhald`) → lokale filer
- Henvendelser fra kontaktskjemaet (persondata) lagres ALDRI i GitHub – bare i
  database/lokalt, og kan videresendes på e-post (Brevo API eller SMTP)

## Kjøre lokalt

```bash
npm install
# Generer passordhash: node src/auth.js hash "passordet-ditt"
ADMIN_PASSWORD_HASH="<hash>" npm start
```

Siden kjører på http://localhost:3000.

## Miljøvariabler

| Variabel | Formål |
|---|---|
| `ADMIN_PASSWORD_HASH` | scrypt-hash for admin-innlogging (`node src/auth.js hash "..."`) |
| `SITE_URL` | Full URL til siden (canonical/sitemap) |
| `SITE_PUBLIC` | `1` = tillat indeksering; ellers noindex (demo-modus) |
| `GITHUB_TOKEN` / `GITHUB_REPO` | Varig lagring av innhold på egen gren |
| `CONTENT_BRANCH` | Gren for innhold (standard `innhald`) |
| `DATABASE_URL` | Postgres – overstyrer GitHub-lagring |
| `BREVO_API_KEY` / `CONTACT_TO` | E-postvarsling for kontaktskjema (Brevo HTTPS-API) |
| `SMTP_HOST/PORT/USER/PASS` | Klassisk SMTP (krever betalt Render-plan) |

Ingen hemmeligheter skal noen gang sjekkes inn i dette repoet – alt settes som
miljøvariabler på Render.
