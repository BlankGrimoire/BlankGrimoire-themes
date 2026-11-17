// SPDX-License-Identifier: MIT

/**
 * Angular Grid Theme Adapter
 *
 * Maps the generic reading flow onto single-page applications built with
 * Angular: a client-rendered card grid on listing pages, a series page with a
 * chapter list and a reader that renders one image per page.
 *
 * Everything here is structural: no origin, host or site identifier appears in
 * this file. The user picks the site and the app supplies its origin. The
 * adapter asks the host for the hidden web view because the markup only exists
 * after the application has rendered.
 */

(function () {
    "use strict";

    var BlankGrimoireRuntime = {
        id: "theme.angulargrid",
        name: "Angular Grid Theme",
        version: "__ADAPTER_VERSION__",
        apiVersion: 1,

        detectionSignature: {
            selectors: [
                // Angular stamps the framework version on the root element.
                "app-root[ng-version]",
                // Critical-CSS inlining used by the same build pipeline.
                "[data-beasties-container]",
                ".series-card"
            ],
            minScore: 30,
            // The document is assembled by the client: selectors only see the
            // rendered DOM when the host fetches through its hidden web view.
            usesWebViewMode: true
        },

        selectors: {
            search: {
                // The listing accepts a free-text query and a page number, but
                // only the first page is reachable from an href.
                path: "/browse?q={query}",
                item: "a.bc",
                title: ".bc-title",
                link: "a",
                cover: ".bc-img"
            },

            details: {
                title: ".series-title",
                cover: ".cover-img",
                synopsis: ".description",
                altTitles: ".alt-titles",
                // The contract has no separate genre group: genres arrive as
                // labels, one element per genre.
                tagsItem: ".genre-tag",
                status: ".badge--status",
                contentRating: ""
            },

            chapters: {
                item: "a.cl-row",
                // The row itself is the anchor; the runtime falls back to the
                // element when the selector finds no descendant.
                link: "a",
                title: ".cl-num",
                date: ".cl-date",
                order: "desc",
                // A price element marks a chapter that costs coins. Locked rows
                // never reach the host.
                excludeItem: ".cl-price"
            },

            pages: {
                strategies: [
                    {
                        // The reader renders one image per page. Paid chapters
                        // replace the strip with a paywall block, so no image is
                        // extracted from them.
                        kind: "css",
                        image: "img.r-page-img",
                        srcAttributes: ["src", "data-src"]
                    }
                ]
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
