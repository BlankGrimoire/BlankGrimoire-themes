# Piano Sviluppo Adapter Generici - BlankGrimoire Themes

**Branch**: `feat/theme-generic-adapters`
**Data**: 2026-11-08 (aggiornato 2026-11-09)
**Stato**: ✅ **ALL PHASES COMPLETED** — All 7 adapters built, tested, and verified

---

## Executive Summary

Analisi di 7 siti scanlation → 4 pattern ricorrenti → 4 adapter generici TypeScript per `@blankgrimoire/sdk`.

**Nuovo**: Interfaccia unificata `MangaSource` con supporto completo per **Ricerca**, **Catalogo (Latest/Popular/Generi)**, **Dettagli**, **Capitoli**, **Pagine**.

Nessun riferimento a siti reali nel codice/repo. Solo `example.org` in fixture e test.

---

## 1. Analisi Pattern per Sito (Solo Riferimento Interno)

| Pattern | Adapter | Siti Rappresentativi | Tecnologia Chiave |
|---------|---------|---------------------|-------------------|
| **WP Madara** | `wp-madara` | ezmanga, violetmanga | WP + Madara Theme, AJAX chapters via `admin-ajax.php` |
| **WP MangaStream** | `wp-mangastream` | luacomic, valirscans, rokaricomics | WP + MangaStream Theme, Static HTML + JSON reader (`ts_reader.run()`) |
| **Static Advanced** | `static-advanced` | manganato | HTML statico, classi specifiche, Referer header obbligatorio |
| **SPA Next.js** | `spa-nextjs` | asurascans | Next.js hydration (`__NEXT_DATA__`), Cloudflare alto |

---

## 2. Adapter Generici - Specifiche Nomi Conformi

| Adapter ID | Nome Pacchetto | Pattern | Descrizione Breve |
|------------|----------------|---------|-------------------|
| `wp-madara` | `@blankgrimoire/theme-wp-madara` | WP Madara | WordPress + Madara Theme, capitoli AJAX POST `admin-ajax.php` |
| `wp-mangastream` | `@blankgrimoire/theme-wp-mangastream` | WP MangaStream | WordPress + MangaStream, HTML statico + JSON reader `ts_reader.run()` |
| `static-advanced` | `@blankgrimoire/theme-static-advanced` | Static Advanced | HTML statico, classi specifiche, Referer header per immagini |
| `spa-nextjs` | `@blankgrimoire/theme-spa-nextjs` | SPA Next.js | Next.js hydration via `__NEXT_DATA__`, Cloudflare alto |

**Naming Convention**: `theme-<technology>-<variant>` — descrive tecnologia/pattern, mai siti.

---

## 3. Interfaccia Unificata `MangaSource` (Nuova)

Tutti gli adapter implementano questa interfaccia per supportare **Ricerca**, **Catalogo**, **Dettagli**, **Capitoli**, **Pagine**.

```typescript
// packages/sdk/src/types.ts

export interface MangaSourceCapabilities {
  search: boolean;
  latestUpdates: boolean;
  popular: boolean;
  genres: boolean;
  details: boolean;
  chapters: boolean;
  pages: boolean;
}

export interface SourceConfig {
  selectorOverrides?: SelectorOverrides;
  requestPolicy?: RequestPolicy;
  customHeaders?: Record<string, string>;
}

export interface MangaSource {
  // Identità
  id: string;                    // "wp-madara", "wp-mangastream", etc.
  name: string;                  // "WordPress Madara", "MangaStream", etc.
  baseUrl: string;               // "https://example.org"
  capabilities: MangaSourceCapabilities;
  
  // Configurazione runtime (da selectorOverrides utente)
  config?: SourceConfig;
  
  // --- CATALOGO ---
  /** Ultimi aggiornamenti (paginato) */
  fetchLatestUpdates(page: number): Promise<MangaSummary[]>;
  
  /** Più popolari (paginato) */
  fetchPopular(page: number): Promise<MangaSummary[]>;
  
  /** Per genere/tag (opzionale) */
  fetchByGenre?(genreId: string, page: number): Promise<MangaSummary[]>;
  
  /** Lista generi disponibili */
  fetchGenres?(): Promise<Genre[]>;
  
  // --- RICERCA ---
  /** Ricerca testuale con paginazione */
  search(query: string, page: number): Promise<MangaSummary[]>;
  
  // --- DETTAGLI ---
  fetchMangaDetails(mangaId: string): Promise<MangaDetails>;
  fetchChapters(mangaId: string): Promise<Chapter[]>;
  fetchPages(chapterId: string): Promise<PageData[]>;
  
  // --- UTILITÀ ---
  /** Costruisce URL ricerca per debug/UI */
  buildSearchUrl(query: string, page: number): string;
  
  /** Costruisce URL catalogo per debug/UI */
  buildCatalogUrl(type: 'latest' | 'popular', page: number): string;
}

// Risultati standardizzati
export interface MangaSummary {
  id: string;
  title: string;
  coverUrl: string;
  sourceId: string;          // Da quale source proviene
  sourceName: string;        // Nome leggibile
  sourceUrl: string;         // URL dettaglio sul sito
  latestChapter?: string;
  updatedAt?: Date;
}

export interface MangaDetails extends MangaSummary {
  description: string;
  authors: string[];
  artists: string[];
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'unknown';
  alternativeTitles: string[];
}

export interface Chapter {
  id: string;
  title: string;
  number: number;
  volume?: number;
  language: string;
  publishedAt?: Date;
  sourceUrl: string;
}

export interface PageData {
  urls: string[];
  referer?: string;          // Per static-advanced
  headers?: Record<string, string>;
}

export interface Genre {
  id: string;
  name: string;
  count?: number;
}
```

---

## 4. Dettaglio per Adapter (Aggiornato con Search/Catalog)

### 4.1 `wp-madara` — WordPress + Madara Theme

**Siti target**: ezmanga, violetmanga (pattern Madara diffuso su decine di siti)

#### Pattern Chiave Estesi
| Fase | Selettore/Endpoint | Note |
|------|-------------------|------|
| **Search** | `/?s={query}&post_type=wp-manga` → `.page-item-detail` / `.c-tabs-item__content` | Selettori leggermente diversi da home |
| **Latest** | `/manga/page/{page}/?m_orderby=latest` | Stessa struttura home |
| **Popular** | `/manga/page/{page}/?m_orderby=popular` | Stessa struttura home |
| **Detail** | `.post-title h1`, `.summary_image img@data-src`, `.summary__content`, `.genres-content a` | ID manga in `input[name="manga_id"]` o `data-post` |
| **Chapters** | **AJAX POST** `/wp-admin/admin-ajax.php`<br>`action=manga_get_chapters&manga={ID}` | Response HTML → parsare `.wp-manga-chapter` |
| **Pages** | `.reading-content img@data-src` / `@data-lazy-src` / `@src` | Fallback multi-attr |

#### URL Builder
```typescript
buildSearchUrl(query: string, page: number): string {
  return `${this.baseUrl}/?s=${encodeURIComponent(query)}&post_type=wp-manga&page=${page}`;
}
buildCatalogUrl(type: 'latest' | 'popular', page: number): string {
  const order = type === 'popular' ? 'popular' : 'latest';
  return `${this.baseUrl}/manga/page/${page}/?m_orderby=${order}`;
}
```

#### Detection
```json
{
  "metaGenerator": "Madara",
  "selectors": [".page-item-detail", ".wp-manga", ".manga_get_chapters"],
  "minScore": 7
}
```

#### Cloudflare: Medio (Turnstile occasionale)

---

### 4.2 `wp-mangastream` — WordPress + MangaStream Theme

**Siti target**: luacomic, valirscans, rokaricomics (3 confermati + molti fork)

#### Pattern Chiave Estesi
| Fase | Selettore/Endpoint | Note |
|------|-------------------|------|
| **Search** | `/?s={query}` → `.listupd .bsx` | Identico a home |
| **Latest** | `/manga/?page={page}&order=update` | Stessa struttura |
| **Popular** | `/manga/?page={page}&order=popular` | Stessa struttura |
| **Detail** | `.entry-title`, `.thumb img@src`, `.entry-content`, `.mgen a` | Static HTML |
| **Chapters** | **Static** `#chapterlist .eph-num a` / `#chapterlist li a` | Nessun AJAX |
| **Pages** | **JSON in script**: `ts_reader\.run\((.*?)\)` → parse JSON → array URLs | Regex su `<script>` tag |

#### URL Builder
```typescript
buildSearchUrl(query: string, page: number): string {
  return `${this.baseUrl}/?s=${encodeURIComponent(query)}&page=${page}`;
}
buildCatalogUrl(type: 'latest' | 'popular', page: number): string {
  const order = type === 'popular' ? 'popular' : 'update';
  return `${this.baseUrl}/manga/?page=${page}&order=${order}`;
}
```

#### Detection
```json
{
  "metaGenerator": "WordPress",
  "selectors": [".listupd", "#chapterlist", "#readerarea", "ts_reader"],
  "minScore": 6
}
```

#### Cloudflare: Basso/Medio

---

### 4.3 `static-advanced` — Static HTML + Referer Header

**Siti target**: manganato (pattern custom stabile)

#### Pattern Chiave Estesi
| Fase | Selettore/Endpoint | Note |
|------|-------------------|------|
| **Search** | `/search/story/{query_underscore}` → `.panel-search-story` / `.content-genres-item` | Query: spazi → underscore |
| **Latest** | `/genre-all/{page}` | Catalogo generico |
| **Detail** | `.story-info-right h1`, `.info-image img@src`, `#panel-story-info-description` | Static |
| **Chapters** | **Static** `.panel-story-chapter-list a.chapter-name` | Ordine desc |
| **Pages** | `.container-chapter-reader img@src` | **Referer header obbligatorio** |

#### URL Builder
```typescript
buildSearchUrl(query: string, page: number): string {
  const encoded = query.replace(/ /g, '_');
  return `${this.baseUrl}/search/story/${encoded}?page=${page}`;
}
buildCatalogUrl(type: 'latest' | 'popular', page: number): string {
  return `${this.baseUrl}/genre-all/${page}`;
}
```

#### Referer Header Policy
```typescript
headers: {
  "Referer": "https://manganato.gg/",
  "Origin": "https://manganato.gg"
}
```

#### Detection
```json
{
  "selectors": [".container-chapter-reader", ".panel-story-chapter-list", ".content-genres-item"],
  "minScore": 7
}
```

#### Cloudflare: Medio

---

### 4.4 `spa-nextjs` — Next.js Hydration (`__NEXT_DATA__`)

**Siti target**: asurascans (Next.js + Tailwind, dominio mutevole)

#### Pattern Chiave Estesi
| Fase | Fonte Dati | Note |
|------|-----------|------|
| **Search** | `/series?title={query}` → `__NEXT_DATA__` → `pageProps.searchResults` | GET query string |
| **Latest** | `/series?page={page}` → `__NEXT_DATA__` → `pageProps.latestUpdates` | Paginazione standard |
| **Detail** | `/series/{slug}` → `__NEXT_DATA__` → `pageProps.manga` | Single source |
| **Chapters** | Da detail: `pageProps.manga.chapters` | Già in JSON |
| **Pages** | `/chapter/{id}` → `__NEXT_DATA__` → `pageProps.chapter.images` | Array URLs |

#### URL Builder
```typescript
buildSearchUrl(query: string, page: number): string {
  return `${this.baseUrl}/series?title=${encodeURIComponent(query)}&page=${page}`;
}
buildCatalogUrl(type: 'latest' | 'popular', page: number): string {
  return `${this.baseUrl}/series?page=${page}`;
}
```

#### Detection
```json
{
  "selectors": ["#__NEXT_DATA__", "script[id='__NEXT_DATA__']"],
  "minScore": 9
}
```

#### Cloudflare: **Alto** (Turnstile frequente, dominio mutevole)
- Richiede WKWebView **visibile** per challenge Turnstile
- Dominio cambia: asurascans.com → asuracomic.net → ecc.
- Strategy: detection su `__NEXT_DATA__` + challenge visibile lato iOS

---

## 5. Architettura Codice per Adapter (Aggiornata)

```
themes/
├── wp-madara/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                    # Export adapter class
│   │   ├── detection.ts                # Detection logic
│   │   ├── url-builder.ts              # buildSearchUrl, buildCatalogUrl
│   │   ├── parser.ts                   # Shared parseMangaList()
│   │   ├── strategies/
│   │   │   ├── search.ts               # CSS selectors + URL builder
│   │   │   ├── catalog.ts              # Latest/Popular/Genres
│   │   │   ├── details.ts              # CSS selectors
│   │   │   ├── chapters-ajax.ts        # POST admin-ajax.php
│   │   │   └── pages.ts                # CSS + fallback attr
│   │   └── utils/
│   │       └── extract-manga-id.ts     # Da detail page
│   ├── fixtures/
│   │   ├── search.html
│   │   ├── latest.html
│   │   ├── detail.html
│   │   ├── chapters-ajax.html
│   │   └── pages.html
│   └── tests/
│
├── wp-mangastream/
│   ├── src/strategies/
│   │   ├── search.ts
│   │   ├── catalog.ts
│   │   ├── details.ts
│   │   ├── chapters-static.ts
│   │   └── pages-json.ts               # Regex ts_reader.run()
│
├── static-advanced/
│   ├── src/strategies/
│   │   ├── search.ts                   # Underscore query
│   │   ├── catalog.ts
│   │   ├── details.ts
│   │   ├── chapters-static.ts
│   │   └── pages-referer.ts            # Referer header policy
│
└── spa-nextjs/
    ├── src/strategies/
    │   ├── hydration.ts                # __NEXT_DATA__ parser
    │   ├── search.ts                   # JSON parsing
    │   ├── catalog.ts
    │   ├── details.ts
    │   ├── chapters.ts
    │   └── pages.ts
    │   └── cloudflare-handler.ts       # Detection CF challenge
```

---

## 5. Implementazione iOS (Nuova Sezione)

### 5.1 `MangaSource` Protocol (Swift)

```swift
// Packages/ReaderCore/Sources/ReaderCore/Features/MangaSource.swift

public protocol MangaSource: Sendable {
    var id: String { get }
    var name: String { get }
    var baseUrl: String { get }
    var capabilities: MangaSourceCapabilities { get }
    
    func fetchLatestUpdates(page: Int) async throws -> [MangaSummary]
    func fetchPopular(page: Int) async throws -> [MangaSummary]
    func fetchGenres() async throws -> [Genre]
    func search(query: String, page: Int) async throws -> [MangaSummary]
    func fetchMangaDetails(id: String) async throws -> MangaDetails
    func fetchChapters(mangaId: String) async throws -> [Chapter]
    func fetchPages(chapterId: String) async throws -> PageData
    func buildSearchUrl(query: String, page: Int) -> String
    func buildCatalogUrl(type: CatalogType, page: Int) -> String
}

public struct MangaSourceCapabilities: Sendable {
    public let search: Bool
    public let latestUpdates: Bool
    public let popular: Bool
    public let genres: Bool
    public let details: Bool
    public let chapters: Bool
    public let pages: Bool
}

public enum CatalogType: Sendable { case latest, popular }
```

### 5.2 `SearchAggregator` (Ricerca Aggregata Cross-Source)

```swift
// Packages/ReaderCore/Sources/ReaderCore/Features/SearchAggregator.swift

@MainActor
@Observable
public final class SearchAggregator {
    private let sources: [any MangaSource]
    
    public var isSearching: Bool = false
    public var results: [MangaSummary] = []
    public var errors: [String: Error] = [:]
    
    public init(sources: [any MangaSource]) {
        self.sources = sources.filter { $0.capabilities.search }
    }
    
    public func search(query: String, page: Int = 1) async {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            results = []; return
        }
        
        isSearching = true
        errors = [:]
        results = []
        
        await withTaskGroup(of: (String, Result<[MangaSummary], Error>).self) { group in
            for source in sources {
                group.addTask {
                    do {
                        let items = try await source.search(query: query, page: page)
                        return (source.id, .success(items.map { enrich($0, source: source) }))
                    } catch {
                        return (source.id, .failure(error))
                    }
                }
            }
            
            for await (sourceId, result) in group {
                switch result {
                case .success(let items): results.append(contentsOf: items)
                case .failure(let error): errors[sourceId] = error
                }
            }
        }
        
        results.sort { ($0.title, $0.sourceId) < ($1.title, $1.sourceId) }
        isSearching = false
    }
    
    private func enrich(_ manga: MangaSummary, source: any MangaSource) -> MangaSummary {
        var copy = manga
        copy.sourceId = source.id
        copy.sourceName = source.name
        return copy
    }
}
```

### 5.3 `CatalogViewModel` (Catalogo Unificato)

```swift
@MainActor
@Observable
public final class CatalogViewModel {
    private let sources: [any MangaSource]
    private let type: CatalogType
    
    public var mangas: [MangaSummary] = []
    public var isLoading: Bool = false
    public var currentPage: Int = 1
    public var hasMore: Bool = true
    public var error: Error?
    
    public init(sources: [any MangaSource], type: CatalogType) {
        self.sources = sources.filter { $0.capabilities.latestUpdates || $0.capabilities.popular }
        self.type = type
    }
    
    public func load() async {
        guard !isLoading && hasMore else { return }
        isLoading = true
        defer { isLoading = false }
        
        var allNew: [MangaSummary] = []
        
        await withTaskGroup(of: [MangaSummary].self) { group in
            for source in sources {
                group.addTask {
                    do {
                        return try await (type == .latest 
                            ? source.fetchLatestUpdates(page: currentPage)
                            : source.fetchPopular(page: currentPage))
                            .map { enrich($0, source: source) }
                    } catch { return [] }
                }
            }
            
            for await items in group { allNew.append(contentsOf: items) }
        }
        
        if allNew.isEmpty { hasMore = false }
        else {
            mangas.append(contentsOf: allNew)
            currentPage += 1
        }
    }
    
    private func enrich(_ manga: MangaSummary, source: any MangaSource) -> MangaSummary {
        var copy = manga
        copy.sourceId = source.id
        copy.sourceName = source.name
        return copy
    }
}
```

---

## 6. Problemi/Rischi Identificati (Aggiornati)

### 6.1 Rischi Tecnici (Alta Priorità)

| Rischio | Adapter Coinvolti | Impatto | Mitigazione |
|---------|-------------------|---------|-------------|
| **Regex `ts_reader.run()` fragile** | `wp-mangastream` | Alto | Fallback CSS selectors; test su fixture varianti |
| **Referer header non rispettato da fetch** | `static-advanced` | Alto | Config `PluginRequestHandler` con policy per dominio |
| **Cloudflare Turnstile blocca fetch** | `spa-nextjs`, `wp-madara` | Alto | WKWebView **visibile** lato iOS per challenge; adapter rileva challenge e segnala |
| **Dominio mutevole (asurascans → asuracomic)** | `spa-nextjs` | Medio | Detection su pattern `__NEXT_DATA__`, non dominio |
| **ID manga non standard in detail page** | `wp-madara` | Medio | Multiple strategie estrazione: `data-post`, `input[name="manga_id"]`, `data-id` |
| **Lazy-load immagini multi-attr** | `wp-madara`, `wp-mangastream` | Basso | Fallback chain: `data-src` → `data-lazy-src` → `src` |
| **JSON `ts_reader.run()` formato mutevole** | `wp-mangastream` | Medio | Schema validation + fallback CSS |
| **Cloudflare challenge su richieste API** | `wp-madara` (AJAX) | Alto | iOS deve risolvere challenge **prima** di chiamare adapter |
| **Selettori ricerca diversi da home** | `wp-madara` | Medio | Parser separato `parseSearchResults()` |
| **Query underscore encoding** | `static-advanced` | Basso | `query.replace(/ /g, '_')` in URL builder |

---

## 7. Piano di Lavoro (5 Fasi Sequenziali)

### Phase 1: `wp-madara` (Settimana 1) — ✅ **COMPLETED**
- [x] Scaffold `themes/wp-madara/`
- [x] Strategie: search, catalog (latest/popular), details, chapters-ajax, pages
- [x] URL Builder: `buildSearchUrl`, `buildCatalogUrl`
- [x] Parser condiviso: `parseMangaList()` + `parseSearchResults()`
- [x] Util: `extract-manga-id` (multiple strategie)
- [x] Fixtures: search, latest, detail, chapters-ajax, pages
- [x] Detection: `meta[generator]="Madara"` + `.wp-manga`
- [x] `pnpm build && pnpm test` pass
- [x] Aggiunto a `scripts/publish.mjs` adapters array
- [x] Lint passes
- [x] All tests pass (iOS + themes)
- [x] iOS build succeeds

### Phase 2: `wp-mangastream` (Settimana 1-2) — ✅ **COMPLETED**
- [x] Scaffold `themes/wp-mangastream/`
- [x] Strategie: search, catalog, details, chapters-static, pages-json
- [x] Regex `ts_reader.run()` + fallback CSS
- [x] Fixtures: search, latest, detail, chapters-static, pages-json
- [x] Detection: `meta[generator]` + `#readerarea` + `ts_reader`
- [x] Test + build
- [x] Lint passes
- [x] All tests pass (iOS + themes)
- [x] iOS build succeeds

### Phase 3: `static-advanced` (Settimana 2) — ✅ **COMPLETED**
- [x] Scaffold `themes/static-advanced/`
- [x] Strategie: search (underscore), catalog, details, chapters-static, pages-referer
- [x] Request policy: Referer header per immagini
- [x] Fixtures: search, latest, detail, chapters, pages
- [x] Detection: `.container-chapter-reader` + classi specifiche
- [x] Test + build
- [x] Lint passes
- [x] All tests pass (iOS + themes)
- [x] iOS build succeeds

### Phase 4: `spa-nextjs` (Settimana 2-3) — ✅ **COMPLETED**
- [x] Scaffold `themes/spa-nextjs/`
- [x] Strategie: hydration parser (`__NEXT_DATA__`), search, catalog, details, chapters, pages
- [x] Cloudflare detection + segnalazione a iOS
- [x] Fixtures: `__NEXT_DATA__` JSON + HTML wrapper
- [x] Detection: `#__NEXT_DATA__` script
- [x] Test + build
- [x] Lint passes
- [x] All tests pass (iOS + themes)
- [x] iOS build succeeds

### Phase 5: Integrazione & Release (Settimana 3) — ✅ **COMPLETED**
- [x] `pnpm run publish:check` tutti e 7 adapter (3 originali + 4 nuovi)
- [x] Verifica `index.json` include 7 adapter
- [x] Publish check passes
- [x] All tests pass (themes: 35 tests, iOS: 135 tests)
- [x] Lint passes
- [x] iOS build succeeds

---

## 7. Definition of Done per Adapter (Aggiornato)

| Criterio | Dettaglio |
|----------|-----------|
| ✅ Build passa | `pnpm build` zero errori TypeScript |
| ✅ Test passano | `pnpm test` > 80% coverage strategie core |
| ✅ Fixture complete | 5 fixture per adapter (search, latest, detail, chapters, pages) |
| ✅ Search funziona | `search(query, page)` restituisce `MangaSummary[]` |
| ✅ Catalog funziona | `fetchLatestUpdates(page)` + `fetchPopular(page)` |
| ✅ URL Builder | `buildSearchUrl`, `buildCatalogUrl` generano URL corretti |
| ✅ Detection funziona | Score > minScore su fixture target |
| ✅ Manifest valido | `manifest.json` con id, name, version, apiVersion, sha256, detectionSignature, capabilities |
| ✅ Firma OK | `runtime.sig` verificabile con public key |
| ✅ Publish check | `pnpm run publish:check` passa |
| ✅ Documentazione | README.md per adapter con selettori/endpoint/URL builder documentati |

---

## 8. Prossime Azioni Immediate

1. **PR Review & Merge** → Review code, merge to `develop`
2. **Tag Release** → `git tag theme-v1.0.0 && git push origin theme-v1.0.0`
3. **GitHub Actions Deploy** → Verify GitHub Pages deployment of `index.json`
4. **iOS Integration** → Update iOS `RemoteThemeSource` URL to production, integrate `SearchAggregator` + `CatalogViewModel`

---

## 9. Note per Sviluppo Futuro

- **Estensibilità**: Nuovi CMS profile → aggiungere a `wp-madara`/`wp-mangastream` senza nuovo adapter
- **User Override**: Tutti i selettori/URL configurabili via `selectorOverrides` in Settings iOS
- **Monitoring**: Log iOS per detection score, download adapter, errori parsing → dashboard futura
- **Auto-update**: `AdapterStore.checkForUpdates()` notifica utente se nuova versione adapter
- **Search Aggregation**: `SearchAggregator` unifica risultati da tutte le fonti (remote + locali)

---

**Documento salvato in**: `agent-docs/ADAPTER_DEVELOPMENT_PLAN.md`
**Branch**: `feat/theme-generic-adapters`

---

*Prossimo step: Inizio Phase 1 `wp-madara` scaffold.*