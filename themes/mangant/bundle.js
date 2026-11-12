// SPDX-License-Identifier: MPL-2.0

/**
 * Carousel List Grid Theme Adapter Bundle
 * 
 * Maps generic reading functionalities to carousel-based grid layouts.
 * This adapter is self-contained and can be imported into the app.
 * 
 * Generic functionalities mapped:
 * - search(query, filters) -> item list
 * - filterByGenre(genres) -> item list
 * - getDetails(key) -> details (title, cover, synopsis, genres, status, etc.)
 * - getChapters(key) -> chapter list (JSON endpoint hook)
 * - getPages(itemKey, chapterKey) -> page images
 * - library integration (add/remove/check)
 * 
 * All selectors are specific to carousel-based grid layouts.
 */

(function () {
    "use strict";

    // Some layouts render the chapter list with JavaScript and fetch it from a
    // JSON endpoint. The endpoint is declared by the page itself through
    // `data-api-url`; this hook reproduces that request so the list is also
    // available when page scripts are not executed.
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
                throw new Error("Chapter request failed" + (response ? ": HTTP " + response.status : ""));
            }
            return JSON.parse(response.body);
        });
    }

    function siteOrigin(url) {
        var match = /^(https?:\/\/[^/?#]+)/i.exec(String(url || ""));
        return match ? match[1] : "";
    }

    function pathSlug(url) {
        var path = String(url || "").split("#")[0].split("?")[0].replace(/\/+$/, "");
        var segments = path.split("/");
        return segments[segments.length - 1] || "";
    }

    // The API returns microseconds; keep the three fractional digits that
    // ISO 8601 parsers accept.
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

    async function fetchChapters(ctx, key) {
        // The key is usually the absolute series URL, but callers may pass
        // only the slug; fall back to the page URL for the origin.
        var origin = siteOrigin(key) || siteOrigin(ctx && ctx.baseURL);
        var slug = pathSlug(key);
        if (!origin || !slug) {
            return [];
        }

        var apiURL = origin + "/api/manga/" + encodeURIComponent(slug) + "/chapters";
        var chapterBase = origin + "/manga/" + encodeURIComponent(slug) + "/";
        var chapters = [];
        var limit = 50;
        var offset = 0;

        for (var page = 0; page < 50; page++) {
            var payload = await requestJSON(apiURL + "?limit=" + limit + "&offset=" + offset);
            var data = payload && payload.data;
            if (!payload || !payload.success || !data || !Array.isArray(data.chapters)) {
                break;
            }

            for (var index = 0; index < data.chapters.length; index++) {
                var item = data.chapters[index];
                if (!item || !item.chapter_slug) {
                    continue;
                }
                var chapter = {
                    key: chapterBase + item.chapter_slug,
                    title: item.chapter_name || item.chapter_slug
                };
                if (typeof item.chapter_num === "number") {
                    chapter.number = item.chapter_num;
                } else if (item.chapter_num !== null && item.chapter_num !== "") {
                    var numeric = Number(item.chapter_num);
                    if (isFinite(numeric)) {
                        chapter.number = numeric;
                    }
                }
                var publishedAt = normalizeDate(item.updated_at);
                if (publishedAt) {
                    chapter.publishedAt = publishedAt;
                }
                chapters.push(chapter);
            }

            var pagination = data.pagination || {};
            if (!pagination.has_more || data.chapters.length === 0) {
                break;
            }
            var currentOffset = Number(pagination.offset);
            offset = isFinite(currentOffset) ? currentOffset + limit : offset + limit;
        }

        chapters.sort(function (left, right) {
            return (right.number || 0) - (left.number || 0);
        });
        return chapters;
    }

    var BlankGrimoireRuntime = {
        id: "theme.mangant",
        name: "Carousel Grid Theme",
        version: "1.1.0",
        apiVersion: 1,

        // Detection signature for theme auto-detection
        detectionSignature: {
            selectors: [
                "form[name=\"frmsearch\"]",
                "#search_story",
                "#search_result",
                ".owl-carousel",
                ".owl-carousel.owl-theme",
                ".owl-wrapper-outer",
                ".wrap-menu-primary",
                ".menu-primary",
                ".item",
                ".chapter-list .row",
                "#chapter-dropdown.navi-change-chapter",
                ".container-chapter-reader",
                ".panel-story-info-description",
                ".comic-info-section",
                "#chapter-list-container[data-api-url]",
                ".genre-list",
                ".list-comic-item-wrap",
                ".panel_page_number"
            ],
            scriptSrc: [
                "owl.carousel",
                "owl.carousel.min",
                "jquery.min",
                "cdn.example.org"
            ],
            probePaths: [
                "/item-list/latest",
                "/search/story/test"
            ],
            minScore: 15,
            usesWebViewMode: false
        },

        // Declarative selectors for all generic functionalities
        selectors: {
            // Search and catalog listing. The same item layout is used by
            // search results and genre/list pages.
            search: {
                path: "/search/story/{query}",
                item: "#search_result ul li, .panel-search-story .content-genres-item, .panel-content-genres .content-genres-item, .list-comic-item-wrap",
                title: "a .story-name, a h3, .genres-item-title a, h3 a",
                link: "a[href*='/manga/'], a[href*='/item/'], a",
                cover: "img",
                nextPage: ".panel_page_number .group_page a.page_select + a[href], .pagination .next a, .page-numbers .next a"
            },

            // Genre discovery and filtering
            genre: {
                // Home page exposes the genre links in the category panel.
                pagePath: "/",
                // A genre result page is `/genre/<slug>`.
                filterPath: "/genre/{genre}",
                source: ".panel-category a[href*='/genre/'][title]",
                valueAttr: "href",
                valuePattern: "/genre/([^/?#]+)"
            },

            // Details page
            details: {
                title: ".manga-info-content .manga-info-text h1, .comic-info-section .info-wrap h1, .story-info-right h1, .manga-title h1",
                cover: ".manga-info-pic img, .comic-info-section .thumbnail-wrap img, .story-info-left img, .info-image img, .manga-cover img",
                // `#contentBox` holds the summary paragraph on the current layout.
                // Do not include `.description`: that block is a site notice and
                // appears earlier in the document, so it would win.
                synopsis: "#contentBox, .panel-story-info-description, #noidungm, .manga-excerpt",
                // Authors are linked on some variants; the current layout only
                // exposes them as prefixed text ("Author(s) : ..."), which is
                // intentionally not used to avoid a duplicated label in the UI.
                authors: ".manga-info-text a[href*='/author/'], .info-wrap a[href*='/author/'], .variations-table .table-value a[href*='author'], .author a",
                artists: ".manga-info-text a[href*='/artist/'], .info-wrap a[href*='/artist/'], .variations-table .table-value a[href*='artist'], .artist a",
                // The runtime reads the first match as a list split on commas
                // and newlines. `.genre-list` holds one anchor per line, so it
                // yields every genre without the "Genres :" label.
                tags: ".genre-list, .manga-info-text li.genres, .variations-table .table-value a[href*='genre'], .genres a, .tags a",
                // The status value is rendered without a link in the newer
                // `comic-info-section` layout; fall back to the prefixed text.
                status: ".comic-info-section .info-wrap > div:nth-child(2) p:last-child, .manga-info-text > li:nth-child(3), .variations-table .table-value.status-value, .status, .manga-status",
                contentRating: ""
            },

            // Chapter list
            chapters: {
                item: ".chapter-list .row, .list-chapter .row, .chapters .row",
                link: "span > a[href*='/chapter-'], span a.chapter-link",
                title: "span > a[href*='/chapter-'], span a.chapter-link",
                date: "span:last-child, .chapter-time, .time",
                views: "span:nth-child(2)",
                order: "desc",
                premiumMarker: ".premium-badge, .vip-tag, [class*=\"coin\"], [class*=\"premium\"], .fa-coins, .fa-lock"
            },

            // Page images (reader)
            pages: {
                strategies: [
                    {
                        kind: "css",
                        image: ".container-chapter-reader img, .chapter-content img, .reading-content img, #chapter-content img, .vung-doc img",
                        srcAttributes: ["src", "data-src", "data-original"]
                    }
                ]
            },

            // Attribution
            attribution: {
                logo: ".top-logo img, .logo img, .header-logo img, .site-logo img",
                credits: ".copyright, .footer-text, .site-credits"
            }
        },

        // The series page loads its chapter list from a JSON endpoint instead
        // of embedding the rows in the HTML. The hook takes precedence over
        // the declarative `selectors.chapters` block, which remains as a
        // fallback for variants that still render rows server-side.
        hooks: {
            getChapters: async function (ctx, key) {
                return fetchChapters(ctx, key);
            }
        },

        // Library integration
        library: {
            addButton: ".btn-add-library, .add-to-library, [data-action=\"add-library\"]",
            removeButton: ".btn-remove-library, .remove-from-library, [data-action=\"remove-library\"]",
            isAddedIndicator: ".library-added, .in-library, [data-in-library=\"true\"]"
        }
    };

    // Export for both CommonJS and ES modules
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

    // Also support AMD
    if (typeof define === "function" && define.amd) {
        define([], function () { return BlankGrimoireRuntime; });
    }
})();