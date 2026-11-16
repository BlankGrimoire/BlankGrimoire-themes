// SPDX-License-Identifier: MIT

/**
 * Series List Theme Adapter
 *
 * Maps the generic reading flow onto the grid-library theme family that renders
 * a card grid on listing pages and a paginated chapter list on series pages.
 *
 * Two layout variants of the same family are covered:
 *
 * - a "stacked" series header (title, alternative titles, cover, synopsis and a
 *   labelled info table) with the chapter list below it;
 * - a "split" series header (title block on one side, cover and an info list on
 *   the other) with the chapter list in a side column.
 *
 * Both variants share the chapter list markup, so a single adapter covers them.
 * The reader container is either server-rendered or hydrated from an inline
 * script; both cases are handled by ordered extraction strategies.
 *
 * Everything here is structural: no origin, host or site identifier appears in
 * this file. The user picks the site and the app supplies its origin.
 */

(function () {
    "use strict";

    var BlankGrimoireRuntime = {
        id: "theme.serieslist",
        name: "Series List Theme",
        version: "__ADAPTER_VERSION__",
        apiVersion: 1,

        // Selectors shared by this family. Every entry below is structural and
        // appears across the family, never on a single site.
        detectionSignature: {
            selectors: [
                ".listupd",
                ".listupd .bsx",
                ".bsx > a .limit",
                ".bsx .bigor .tt",
                ".ts-post-image",
                ".bixbox .releases",
                ".metas-genres-values",
                ".eplister#chapterlist",
                ".eph-num .chapternum",
                ".chbox",
                ".bxcl",
                ".seriestucon",
                ".seriestuheader h1.entry-title",
                ".main-info .info-half .titles",
                ".tsinfo .imptdt",
                ".ts-breadcrumb",
                ".headpost",
                ".chapterbody",
                ".chnav",
                "#readerarea"
            ],
            minScore: 60,
            usesWebViewMode: false
        },

        selectors: {
            // The listing card is reused by search results, genre pages and
            // the latest-updates grid, so one item selector covers all three.
            search: {
                path: "/?s={query}",
                item: ".listupd .bs",
                title: ".bigor .tt",
                link: "a",
                cover: "img",
                nextPage: ".pagination a.next"
            },

            // Genre links are rendered per series on listing pages and in the
            // series header, so discovery reads the first card that has them.
            genre: {
                pagePath: "/",
                filterPath: "/genres/{genre}/",
                source: ".metas-genres-values a, .genres-container .mgen a",
                valueAttr: "href",
                valuePattern: "/genres/([^/?#]+)"
            },

            details: {
                title: ".seriestuheader h1.entry-title, .main-info h1.entry-title",
                cover: ".seriestucontl .thumb img, .thumb-half .thumb img",
                synopsis: ".seriestucontentr .entry-content, .summary .entry-content",
                altTitles: ".seriestualt, .alternative .desktop-titles",
                tags: ".seriestugenre a, .genres-container .mgen a",
                // One element per label: a group of sibling anchors otherwise
                // collapses into the first genre or one joined string.
                tagsItem: ".seriestugenre a, .genres-container .mgen a",
                // The stacked variant exposes status in the first info-table
                // row; the split variant uses a labelled info list.
                status: ".infotable tr:nth-child(1) td:nth-child(2), .tsinfo .imptdt:nth-child(2) i",
                // Only the split variant labels author and artist separately.
                // The stacked variant shows the uploader, which is not an
                // author, so it is deliberately left unmapped.
                authors: ".tsinfo .imptdt:nth-child(4) i",
                artists: ".tsinfo .imptdt:nth-child(5) i",
                contentRating: ""
            },

            chapters: {
                // Entries the site marks with a paid/coin badge are dropped at
                // the selector level, so locked chapters never reach an
                // adapter response.
                item: ".eplister ul li:not(:has(.text-gold))",
                // The stacked variant nests the link inside the entry, the
                // split variant wraps the whole entry in the link.
                link: ".eph-num a, a",
                title: ".chapternum",
                date: ".chapterdate",
                order: "desc"
            },

            pages: {
                strategies: [
                    {
                        // Server-rendered reader container.
                        kind: "css",
                        image: "#readerarea img",
                        srcAttributes: ["src", "data-src", "data-lazy-src"]
                    },
                    {
                        // Hydrated reader: the page list is passed to an inline
                        // script as a JSON argument.
                        kind: "scriptJSON",
                        pattern: "ts_reader\\.run",
                        path: "sources[0].images"
                    }
                ]
            },

            attribution: {
                logo: ".logo img, .site-logo img, .footer-logo img",
                credits: ".copyright, .site-credits, .footer-copyright"
            }
        },

        // Library integration through the site's own bookmark control.
        library: {
            addButton: ".bookmark:not(.bookmarked), .btn-add-library",
            removeButton: ".bookmarked, .btn-remove-library",
            isAddedIndicator: ".bookmarked, [data-in-library=\"true\"]"
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
