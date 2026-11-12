// SPDX-License-Identifier: MPL-2.0

/**
 * MangaNato Theme Adapter Bundle
 * 
 * Maps generic manga reading functionalities to MangaNato's HTML structure.
 * This adapter is self-contained and can be imported into the BlankGrimoire app.
 * 
 * Generic functionalities mapped:
 * - search(query, filters) -> manga list
 * - filterByGenre(genres) -> manga list
 * - getDetails(key) -> manga details (title, cover, synopsis, genres, status, etc.)
 * - getChapters(key) -> chapter list (with premium filtering)
 * - getPages(mangaKey, chapterKey) -> page images
 * - library integration (add/remove/check)
 * 
 * All selectors are specific to MangaNato's HTML structure.
 */

(function () {
    "use strict";

    var BlankGrimoireRuntime = {
        id: "theme.manganato",
        name: "MangaNato",
        version: "1.0.0",
        apiVersion: 1,

        // Detection signature for theme auto-detection
        detectionSignature: {
            selectors: [
                "form[name=\"frmsearch\"]",
                "#search_story.searchi",
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
                ".panel-story-info-description"
            ],
            scriptSrc: [
                "owl.carousel",
                "owl.carousel.min",
                "jquery.min",
                "2xstorage.com"
            ],
            probePaths: [
                "/manga-list/latest-manga",
                "/search/story/test"
            ],
            minScore: 20,
            usesWebViewMode: false
        },

        // Declarative selectors for all generic functionalities
        selectors: {
            // Search functionality
            search: {
                path: "/search/story/{query}",
                item: "#search_result ul li",
                title: "a .story-name, a h3",
                link: "a",
                cover: "img",
                nextPage: ".pagination .next a, .page-numbers .next a"
            },

            // Manga details page
            details: {
                title: ".story-info-right h1, .manga-title h1",
                cover: ".story-info-left img, .info-image img, .manga-cover img",
                synopsis: ".panel-story-info-description, #noidungm, .description",
                authors: ".variations-table .table-value a[href*='author'], .author a",
                artists: ".variations-table .table-value a[href*='artist'], .artist a",
                genres: ".variations-table .table-value a[href*='genre'], .genres a, .tags a",
                status: ".variations-table .table-value:not(:has(a)), .status, .manga-status",
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
                logo: ".logo img, .header-logo img, .site-logo img",
                credits: ".copyright, .footer-text, .site-credits"
            }
        },

        // Genre extraction for filter-by-genre functionality
        genreMapping: {
            source: ".variations-table .table-value a[href*='genre'], .genres a",
            extract: "text",
            normalize: true
        },

        // Library integration
        library: {
            addButton: ".btn-add-library, .add-to-library, [data-action=\"add-library\"]",
            removeButton: ".btn-remove-library, .remove-from-library, [data-action=\"remove-library\"]",
            isAddedIndicator: ".library-added, .in-library, [data-in-library=\"true\"]"
        },

        // Optional hooks for edge cases (override declarative behavior)
        hooks: {
            // Custom search if needed
            search: async function (ctx, query) {
                // Use declarative by default
                return null;
            },

            // Custom details extraction
            getMangaDetails: async function (ctx, key) {
                return null;
            },

            // Custom chapter list extraction with premium filtering
            getChapters: async function (ctx, key) {
                return null;
            },

            // Custom page extraction
            getPages: async function (ctx, mangaKey, chapterKey) {
                return null;
            },

            // Library operations
            addToLibrary: async function (ctx, mangaKey) {
                // Implementation would click add button and verify
                return null;
            },

            removeFromLibrary: async function (ctx, mangaKey) {
                return null;
            },

            isInLibrary: async function (ctx, mangaKey) {
                return null;
            }
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