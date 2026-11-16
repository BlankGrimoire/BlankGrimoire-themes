// SPDX-License-Identifier: MIT

/**
 * Astro Grid Theme Adapter
 *
 * Maps the generic reading flow onto statically generated content sites that
 * render a card grid on listing pages, a JSON-driven chapter list on series
 * pages and a `data-page`-based reader.
 *
 * Everything here is structural: no origin, host or site identifier appears in
 * this file. The user picks the site and the app supplies its origin. The
 * adapter declares `networkHosts` instead of a domain, and the host expands it
 * against the site the user configured.
 */

(function () {
    "use strict";

    function nativeHost() {
        if (typeof globalThis !== "undefined" && globalThis.__native) {
            return globalThis.__native;
        }
        if (typeof __native !== "undefined") {
            return __native;
        }
        return null;
    }

    function requestJSON(url) {
        var host = nativeHost();
        if (!host || typeof host.request !== "function") {
            return Promise.reject(new Error("The HTTP bridge is unavailable"));
        }
        return Promise.resolve(
            host.request({
                url: url,
                method: "GET",
                headers: { Accept: "application/json" }
            })
        ).then(function (response) {
            if (!response || response.status < 200 || response.status >= 300) {
                throw new Error(
                    "Request failed" + (response ? ": HTTP " + response.status : "")
                );
            }
            return JSON.parse(response.body);
        });
    }

    function originOf(value) {
        var match = /^(https?:\/\/[^/?#]+)/i.exec(String(value || ""));
        return match ? match[1].replace(/\/+$/, "") : "";
    }

    /**
     * The API lives on a sibling host (`api.<site host>`) and the host expands
     * the same template that `networkHosts` declares.
     */
    function apiOrigin(ctx) {
        var origin = originOf(ctx && ctx.baseURL);
        var match = /^(https?:\/\/)([^/?#:]+)(:\d+)?$/i.exec(origin);
        if (!match) {
            return "";
        }
        var host = match[2].toLowerCase().replace(/^www\./, "");
        return match[1] + "api." + host + (match[3] || "");
    }

    function apiURL(ctx, path) {
        var origin = apiOrigin(ctx);
        return origin === "" ? "" : origin + path;
    }

    function absoluteURL(value, baseURL) {
        var text = String(value || "").trim();
        if (text === "" || /^https?:\/\//i.test(text)) {
            return text;
        }
        var origin = originOf(baseURL);
        if (origin === "" || text.charAt(0) !== "/") {
            return text;
        }
        return origin + text;
    }

    /** The key is the absolute series URL; the API accepts its last segment. */
    function seriesSlug(key) {
        var path = String(key || "").split("#")[0].split("?")[0].replace(/\/+$/, "");
        var segments = path.split("/");
        return segments[segments.length - 1] || "";
    }

    function seriesKey(ctx, item) {
        var publicURL = typeof item.public_url === "string" ? item.public_url : "";
        if (/^https?:\/\//i.test(publicURL)) {
            return publicURL;
        }
        var origin = originOf(ctx && ctx.baseURL);
        return origin === "" ? String(item.slug || "") : origin + "/comics/" + item.slug;
    }

    // The API returns microseconds; keep the three fractional digits that ISO
    // 8601 parsers accept.
    function normalizeDate(value) {
        if (typeof value !== "string") {
            return undefined;
        }
        var match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/.exec(value);
        if (!match) {
            return value;
        }
        var fraction = match[2] ? match[2].slice(0, 4) : "";
        return match[1] + fraction + (match[3] || "Z");
    }

    function stripHTML(value) {
        var text = String(value || "");
        text = text
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<\/(p|div|li)>/gi, " ")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&amp;/gi, "&");
        return text.replace(/\s+/g, " ").trim();
    }

    function normalizeStatus(value) {
        var text = String(value || "").toLowerCase();
        if (/(ongoing|publishing|in progress)/.test(text)) {
            return "ongoing";
        }
        if (/(completed|finished|ended)/.test(text)) {
            return "completed";
        }
        if (/(hiatus|on hold|paused)/.test(text)) {
            return "hiatus";
        }
        if (/(cancelled|canceled|dropped)/.test(text)) {
            return "cancelled";
        }
        return "unknown";
    }

    function chapterNumber(value) {
        if (typeof value === "number" && isFinite(value)) {
            return value;
        }
        if (value === null || value === undefined || value === "") {
            return undefined;
        }
        var numeric = Number(value);
        return isFinite(numeric) ? numeric : undefined;
    }

    async function fetchSearch(ctx, q) {
        var limit = 24;
        var page = Number(q && q["page"]);
        if (!isFinite(page) || page < 1) {
            page = 1;
        }
        var params = ["limit=" + limit, "offset=" + (page - 1) * limit];
        var text = String((q && q.text) || "").trim();
        if (text !== "") {
            params.unshift("search=" + encodeURIComponent(text));
        }

        var payload = await requestJSON(apiURL(ctx, "/api/series?" + params.join("&")));
        var data = payload && Array.isArray(payload.data) ? payload.data : [];
        var items = [];

        for (var index = 0; index < data.length; index++) {
            var item = data[index];
            if (!item || typeof item.slug !== "string" || item.slug === "") {
                continue;
            }
            var summary = {
                key: seriesKey(ctx, item),
                title: String(item.title || item.slug)
            };
            var cover = item.cover || item.cover_url;
            if (typeof cover === "string" && cover !== "") {
                summary.coverURL = absoluteURL(cover, ctx && ctx.baseURL);
            }
            items.push(summary);
        }

        var meta = payload && payload.meta ? payload.meta : {};
        var total = typeof meta.total === "number" ? meta.total : null;
        var hasNextPage =
            total !== null ? page * limit < total : Boolean(meta.has_more);
        return { items: items, hasNextPage: hasNextPage };
    }

    async function fetchDetails(ctx, key) {
        var slug = seriesSlug(key);
        if (slug === "") {
            throw new Error("The series key has no slug");
        }

        var payload = await requestJSON(
            apiURL(ctx, "/api/series/" + encodeURIComponent(slug))
        );
        var series = payload && payload.series;
        if (!series) {
            throw new Error("The series payload is missing");
        }

        var details = {
            key: key,
            title: String(series.title || slug),
            status: normalizeStatus(series.status),
            contentRating: "unknown",
            attribution: {
                siteName: String((ctx && ctx.siteName) || ""),
                siteURL: originOf(ctx && ctx.baseURL)
            }
        };

        if (typeof series.cover === "string" && series.cover !== "") {
            details.coverURL = absoluteURL(series.cover, ctx && ctx.baseURL);
        }
        var synopsis = stripHTML(series.description);
        if (synopsis !== "") {
            details.synopsis = synopsis;
        }
        if (Array.isArray(series.alt_titles) && series.alt_titles.length > 0) {
            details.altTitles = series.alt_titles.map(String);
        }
        if (typeof series.author === "string" && series.author !== "") {
            details.authors = [series.author];
        }
        if (typeof series.artist === "string" && series.artist !== "") {
            details.artists = [series.artist];
        }
        var tags = [];
        if (Array.isArray(series.genres)) {
            for (var index = 0; index < series.genres.length; index++) {
                var genre = series.genres[index];
                if (genre && typeof genre.name === "string" && genre.name !== "") {
                    tags.push(genre.name);
                }
            }
        }
        if (tags.length > 0) {
            details.tags = tags;
        }

        return details;
    }

    async function fetchChapters(ctx, key) {
        var slug = seriesSlug(key);
        if (slug === "") {
            return [];
        }

        // The chapter endpoint rejects very large limits with HTTP 403, so the
        // list is paged with a safe page size and an offset cursor.
        var limit = 200;
        var data = [];
        for (var page = 0; page < 50; page++) {
            var payload = await requestJSON(
                apiURL(
                    ctx,
                    "/api/series/" +
                        encodeURIComponent(slug) +
                        "/chapters?limit=" +
                        limit +
                        "&offset=" +
                        page * limit
                )
            );
            var batch = payload && Array.isArray(payload.data) ? payload.data : [];
            for (var batchIndex = 0; batchIndex < batch.length; batchIndex++) {
                data.push(batch[batchIndex]);
            }
            if (batch.length < limit) {
                break;
            }
        }
        var origin = originOf(key) || originOf(ctx && ctx.baseURL);
        var chapters = [];

        for (var index = 0; index < data.length; index++) {
            var item = data[index];
            // Rule 9: the payload flags locked entries; they never reach the host.
            if (!item || item.is_premium === true) {
                continue;
            }
            var number = chapterNumber(item.number);
            var chapter = {
                key:
                    origin +
                    "/comics/" +
                    encodeURIComponent(slug) +
                    "/chapter/" +
                    (number !== undefined ? number : item.slug),
                title: number !== undefined ? "Chapter " + number : String(item.slug || "")
            };
            if (number !== undefined) {
                chapter.number = number;
            }
            var publishedAt = normalizeDate(item.published_at);
            if (publishedAt) {
                chapter.publishedAt = publishedAt;
            }
            chapters.push(chapter);
        }

        chapters.sort(function (left, right) {
            return (right.number || 0) - (left.number || 0);
        });
        return chapters;
    }

    var BlankGrimoireRuntime = {
        id: "theme.astrogrid",
        name: "Astro Grid Theme",
        version: "__ADAPTER_VERSION__",
        apiVersion: 1,

        // The API is served from a sibling host. See ThemeAdapter.networkHosts:
        // the host expands `{host}` against the site the user configured.
        networkHosts: ["api.{host}"],

        detectionSignature: {
            metaGenerator: "Astro",
            selectors: [
                "#home-main",
                "#home-side",
                "[data-content-mode-link]",
                "#series-grid",
                ".series-card",
                "#continue-reading-data",
                "#description-text",
                "[data-page-index]"
            ],
            minScore: 60,
            // Series and reader pages sit behind a challenge; the host resolves
            // it in its hidden web view before extraction.
            usesWebViewMode: true
        },

        // Declarative fallback for pages rendered without JavaScript. The hooks
        // below take precedence and read the same API the page uses.
        selectors: {
            search: {
                path: "/browse?search={query}",
                item: ".series-card",
                title: "h3",
                link: "a[href*='/comics/']",
                cover: "img"
            },

            genre: {
                pagePath: "/browse",
                filterPath: "/browse?genres={genre}",
                source: "a[href*='genres=']",
                valueAttr: "href",
                valuePattern: "genres=([^&?#]+)"
            },

            details: {
                title: "h1",
                cover: "#desktop-cover-container img, #mobile-cover-container img",
                synopsis: "#description-text",
                altTitles: "#alt-titles",
                tags: "a[href*='genres=']",
                contentRating: ""
            },

            chapters: {
                // The server-rendered list repeats the first chapter in a
                // "resume" button, which carries a fragment.
                item: "a[href*='/chapter/']:not([href*='#'])",
                link: "a",
                // The row is the anchor itself: the selectors start at it so
                // an ancestor outside the row cannot satisfy the combinator.
                title: "a > div:nth-child(1) span",
                date: "a > div:nth-child(2) span",
                order: "desc"
            },

            pages: {
                strategies: [
                    {
                        // Pages are server-rendered: one wrapper per image.
                        kind: "css",
                        image: "[data-page] img, img[data-page-index]",
                        srcAttributes: ["src", "data-src"]
                    }
                ]
            },

            attribution: {
                logo: "[data-content-home-link] img, header a[href='/'] img"
            }
        },

        hooks: {
            search: async function (ctx, q) {
                return fetchSearch(ctx, q);
            },
            getMangaDetails: async function (ctx, key) {
                return fetchDetails(ctx, key);
            },
            getChapters: async function (ctx, key) {
                return fetchChapters(ctx, key);
            }
        }
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = BlankGrimoireRuntime;
        module.exports.default = BlankGrimoireRuntime;
    }
    if (typeof exports !== "undefined") {
        exports.default = BlankGrimoireRuntime;
    }
    if (typeof window !== "undefined") {
        window.BlankGrimoireRuntime = BlankGrimoireRuntime;
    }
    if (typeof globalThis !== "undefined") {
        globalThis.BlankGrimoireRuntime = BlankGrimoireRuntime;
    }
})();
