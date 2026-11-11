# Piano Sviluppo Theme Adapters Generici

## Obiettivo
Creare adapter generici che coprano i pattern comuni dei 7 siti target, senza essere site-specific.

## Siti Target (Pattern Recognition)

| Sito | Pattern Probabile | Note |
|------|-------------------|------|
| site-a.example.org | CMS custom / WordPress variant | Cloudflare probabile |
| site-b.example.org | Static HTML / Simple CMS | Selettori CSS standard |
| site-c.example.org | Platform nota (generic platform) | Struttura nota, AJAX per capitoli |
| site-d.example.org | Sconosciuto | Da analizzare |
| site-e.example.org | Scanlation site custom | Cloudflare probabile |
| site-f.example.org | Sconosciuto | Da analizzare |
| site-g.example.org | Sconosciuto | Da analizzare |

## Pattern Comuni Identificati

### 1. **Static HTML + CSS Selectors** (Base)
- Lista manga: paginazione server-side
- Dettagli: meta tag + selettori CSS
- Capitoli: lista ordinata in HTML
- Pagine: `<img>` dirette o `data-src`

### 2. **AJAX Chapter Loading**
- Capitoli caricati via `fetch/XHR` dopo load pagina
- Endpoint tipo `/api/chapters/{manga_id}` o `/ajax/chapters`
- Risposta JSON → render client-side

### 3. **SPA / Hydration** (già coperto da `spa-hydration`)
- Next.js / Nuxt / React
- Dati in `__NEXT_DATA__` o `window.__DATA__`
- Estrazione da script JSON

### 4. **JSON API Native**
- Sito = frontend + API separata
- `/api/v1/manga`, `/api/v1/chapters`, `/api/v1/pages`
- Risposte JSON strutturate

### 5. **Cloudflare Challenge** (gestito lato iOS)
- Tutte le richieste passano per challenge visibile
- Adapter non deve gestirlo (WKWebView visibile lato app)

---

## Adapter Da Creare

### A. `theme-static-css` — **Base universale**
**Copia/estende** logica CSS selectors puri
- Target: site-b.example.org, siti statici semplici
- Strategie: solo CSS per tutto
- Configurabile via `selectorOverrides` utente

### B. `theme-ajax-chapters` — **Capitoli via AJAX**
- Target: site-c.example.org, siti che caricano capitoli via XHR
- Estende static-css + aggiunge strategia AJAX per capitoli
- Rileva endpoint XHR da Network tab / pattern URL

### C. `theme-json-api` — **API JSON native**
- Target: siti headless / API-first
- Estrae endpoint da `window.config` o `/api` discovery
- Pagine: direct image URLs da JSON

### D. `theme-generic-cms` — **CMS comuni (WP, Drupal, custom)**
- Target: site-a.example.org, site-e.example.org, site-g.example.org
- Rileva CMS via meta generator / path pattern
- Selettori parametrizzabili per struttura CMS

---

## Architettura Implementazione

```
themes/
├── static-css/           # Base: solo CSS selectors
│   ├── src/
│   │   ├── index.ts
│   │   ├── strategies/
│   │   │   ├── css-search.ts
│   │   │   ├── css-details.ts
│   │   │   ├── css-chapters.ts
│   │   │   └── css-pages.ts
│   │   └── detection.ts
│   ├── fixtures/
│   └── package.json
│
├── ajax-chapters/        # Estende static-css + AJAX chapters
│   ├── src/
│   │   ├── strategies/
│   │   │   └── ajax-chapters.ts
│   │   └── detection.ts
│   └── package.json
│
├── json-api/             # API JSON native
│   ├── src/
│   │   ├── strategies/
│   │   │   ├── api-search.ts
│   │   │   ├── api-details.ts
│   │   │   ├── api-chapters.ts
│   │   │   └── api-pages.ts
│   │   └── detection.ts
│   └── package.json
│
└── generic-cms/          # CMS parametrico
    ├── src/
    │   ├── cms-detector.ts
    │   ├── cms-profiles/
    │   │   ├── wordpress.ts
    │   │   ├── drupal.ts
    │   │   └── custom-cms.ts
    │   └── detection.ts
    └── package.json
```

---

## Strategie di Estrazione Per Adapter

### `static-css` (base)
```typescript
// Search
path: "/search?q={query}"
item: ".manga-item, .series-item, .book-item"
title: ".title a, h3 a, .manga-title"
link: "a@href"
cover: "img@data-src, img@src"

// Details
title: "h1, .manga-title, .series-title"
cover: ".cover img@src, .thumbnail img@src"
synopsis: ".description, .synopsis, .summary"
authors: ".author, .authors a"
tags: ".genres a, .tags a"

// Chapters
item: ".chapter-item, .chapter-row, li.chapter"
link: "a@href"
title: ".chapter-title, .chapter-number"
date: ".chapter-date, time@datetime"
order: "desc" | "asc"

// Pages
strategies: [
  { kind: "css", image: ".reader img, .page img", srcAttributes: ["data-src", "src"] }
]
```

### `ajax-chapters` (aggiunge)
```typescript
// Chapters via AJAX
strategies: [
  { kind: "ajax", method: "GET", path: "/ajax/chapters/{mangaId}", then: { kind: "css", ... } },
  { kind: "ajax", method: "POST", path: "/api/chapters", body: "manga_id={id}", then: { kind: "css", ... } }
]
```

### `json-api` (sostituisce)
```typescript
// Search
path: "/api/v1/search?q={query}"
item: "data[]"
title: "title"
link: "slug" → "/manga/{slug}"

// Details
path: "/api/v1/manga/{id}"
title: "title"
cover: "cover_url"

// Chapters
path: "/api/v1/manga/{id}/chapters"
item: "data[]"
link: "chapter_id" → "/chapter/{id}"

// Pages
path: "/api/v1/chapter/{id}/pages"
item: "data[]"
image: "image_url"
```

---

## Detection Signature Per Adapter

| Adapter | Meta Generator | Selectors Chiave | Min Score |
|---------|----------------|------------------|-----------|
| static-css | - | `.manga-item`, `.chapter-item` | 5 |
| ajax-chapters | - | `.chapter-list[data-ajax]`, `data-chapters-url` | 7 |
| json-api | `api` in meta | `window.apiBase`, `/api/v1/` in scripts | 8 |
| generic-cms | `WordPress`, `Drupal`, `CMS` | `.wp-content`, `.drupal` | 6 |

---

## Fixtures Sintetici (example.org)

Ogni tema deve avere fixture in `fixtures/`:
```
fixtures/
├── search.html          # Risultati ricerca
├── detail.html          # Pagina dettaglio manga
├── chapters.html        # Lista capitoli (static)
├── chapters-ajax.json   # Risposta AJAX capitoli
├── api-search.json      # Risposta API search
├── api-detail.json      # Risposta API detail
├── api-chapters.json    # Risposta API chapters
├── page.html            # Pagina lettura
└── page-images.html     # Pagina con immagini
```

Contenuto: **Lorem ipsum**, domini `example.org`, struttura HTML realistica ma fake.

---

## Task List

### Phase 1: Base `static-css`
- [ ] Scaffold tema `static-css`
- [ ] Implementa strategie CSS per search, details, chapters, pages
- [ ] Detection generica (score basso, fallback)
- [ ] Fixtures sintetiche complete
- [ ] Test: `pnpm build && pnpm test`

### Phase 2: `ajax-chapters`
- [ ] Scaffold estende static-css
- [ ] Strategia AJAX per capitoli (GET/POST, header, body)
- [ ] Detection: cerca `data-chapters-url`, `.chapter-list[data-ajax]`
- [ ] Fixtures: `chapters-ajax.json`
- [ ] Test

### Phase 3: `json-api`
- [ ] Scaffold standalone
- [ ] Strategie API per search, details, chapters, pages
- [ ] Auto-discovery endpoint da `window.__CONFIG__` o meta
- [ ] Fixtures JSON
- [ ] Test

### Phase 4: `generic-cms`
- [ ] Scaffold
- [ ] CMS detector (WP, Drupal, custom via pattern)
- [ ] Profili selettori per CMS noti
- [ ] Override utente via `selectorOverrides`
- [ ] Test

### Phase 5: Integrazione & Release
- [ ] Aggiungi 4 temi a `scripts/publish.mjs` adapters array
- [ ] `pnpm run publish:check` passa
- [ ] PR → main → auto-release tag
- [ ] Verifica `index.json` include tutti e 4

---

## Mapping Siti → Adapter (Stima)

| Sito | Adapter Primario | Fallback |
|------|------------------|----------|
| site-a.example.org | generic-cms (WP-like) | static-css |
| site-b.example.org | static-css | - |
| site-c.example.org | ajax-chapters | static-css |
| site-d.example.org | static-css / json-api | - |
| site-e.example.org | generic-cms | static-css |
| site-f.example.org | static-css / json-api | - |
| site-g.example.org | generic-cms / ajax-chapters | - |

---

## Note Implementazione

1. **Nessun dominio reale** in codice/test/fixture → solo `example.org`
2. **Nomi generici**: `theme-static-css`, `theme-ajax-chapters`, `theme-json-api`, `theme-generic-cms`
3. **Parametrizzazione**: tutto configurabile via `selectorOverrides` utente
4. **Detection score basso** per adapter generici (5-8) → l'utente può forzare tema
5. **Estensibilità**: nuovi CMS profili aggiungibili senza nuovo tema

---

## Prossimo Step

Approvazione piano → creo scaffold `static-css` come base, poi gli altri in sequenza.