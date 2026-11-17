// SPDX-License-Identifier: MIT

/**
 * Alpine Grid Theme Adapter
 *
 * Maps the generic reading flow onto content sites that render with Alpine.js
 * and ship their catalogue through same-origin JSON endpoints:
 *
 * - search and chapter lists come from `/api/...` JSON;
 * - series metadata is embedded in a `#comic-data` JSON script;
 * - reader pages are embedded in a `#sv-data` JSON script on the chapter page.
 *
 * Everything here is structural: no origin, host or site identifier appears in
 * this file. The user picks the site and the app supplies its origin.
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

    function requestText(url) {
        var host = nativeHost();
        if (!host || typeof host.request !== "function") {
            return Promise.reject(new Error("The HTTP bridge is unavailable"));
        }
        return Promise.resolve(host.request({ url: url, method: "GET" })).then(function (response) {
            if (!response || response.status < 200 || response.status >= 300) {
                throw new Error(
                    "Request failed" + (response ? ": HTTP " + response.status : "")
                );
            }
            return response.body;
        });
    }

    function requestJSON(url) {
        return requestText(url).then(function (body) {
            return JSON.parse(body);
        });
    }

    function originOf(value) {
        var match = /^(https?:\/\/[^/?#]+)/i.exec(String(value || ""));
        return match ? match[1].replace(/\/+$/, "") : "";
    }

    /** Path segment after `/comic/`, without query or fragment. */
    function seriesSlug(key) {
        var match = /\/comic\/([^/?#]+)/i.exec(String(key || ""));
        return match ? match[1] : "";
    }

    function seriesURL(ctx, slug) {
        var origin = originOf(ctx && ctx.baseURL);
        return origin === "" ? "" : origin + "/comic/" + encodeURIComponent(slug);
    }

    function stripHTML(value) {
        return String(value || "")
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<\/(p|div|li)>/gi, " ")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&amp;/gi, "&")
            .replace(/\s+/g, " ")
            .trim();
    }

    function metadataList(value, key) {
        if (!value || typeof value !== "object") {
            return [];
        }
        return Object.keys(value)
            .map(function (id) {
                var entry = value[id];
                return entry && typeof entry[key] === "string" ? entry[key].trim() : "";
            })
            .filter(function (text) {
                return text !== "";
            });
    }

    /** The payload uses 1 for ongoing, 2 for completed and 3 for unknown. */
    function mapStatus(value) {
        var code = Number(value);
        if (code === 1) {
            return "ongoing";
        }
        if (code === 2) {
            return "completed";
        }
        return "unknown";
    }

    function mapContentRating(value) {
        var text = String(value || "").trim().toLowerCase();
        if (text === "safe" || text === "suggestive" || text === "mature") {
            return text;
        }
        return "unknown";
    }

    function chapterNumber(value) {
        var numeric = Number(value);
        return isFinite(numeric) ? numeric : undefined;
    }

    function chapterURL(origin, slug, item) {
        return (
            origin +
            "/comic/" +
            encodeURIComponent(slug) +
            "/" +
            encodeURIComponent(String(item.hid || "")) +
            "-chapter-" +
            encodeURIComponent(String(item.chap || "")) +
            "-" +
            encodeURIComponent(String(item.lang || "en"))
        );
    }

    async function fetchSearch(ctx, q) {
        var origin = originOf(ctx && ctx.baseURL);
        if (origin === "") {
            return { items: [], hasNextPage: false };
        }

        var page = Number(q && q["page"]);
        if (!isFinite(page) || page < 1) {
            page = 1;
        }
        var text = String((q && q.text) || "").trim();
        var params = ["page=" + page];
        if (text !== "") {
            params.unshift("q=" + encodeURIComponent(text));
        }

        var payload = await requestJSON(origin + "/api/search?" + params.join("&"));
        var data = payload && Array.isArray(payload.data) ? payload.data : [];
        var items = data
            .filter(function (item) {
                return item && typeof item.slug === "string" && item.slug !== "";
            })
            .map(function (item) {
                var summary = { key: seriesURL(ctx, item.slug), title: String(item.title || "") };
                if (typeof item.default_thumbnail === "string" && item.default_thumbnail !== "") {
                    summary.coverURL = item.default_thumbnail;
                }
                return summary;
            });

        return { items: items, hasNextPage: Boolean(payload && payload.next_page_url) };
    }

    /** Read an inline JSON payload by script id, without a DOM dependency. */
    function readPayload(html, id) {
        var pattern = new RegExp(
            '<script[^>]*\\bid="' + id + '"[^>]*>([\\s\\S]*?)</script>',
            "i"
        );
        var match = pattern.exec(String(html || ""));
        if (!match || match[1] === undefined) {
            return null;
        }
        return JSON.parse(match[1]);
    }

    async function fetchDetails(ctx, key) {
        var html = await requestText(key);
        var payload = readPayload(html, "comic-data");
        if (!payload) {
            throw new Error("The series payload is missing");
        }
        var details = {
            key: key,
            title: String(payload.title || ""),
            status: mapStatus(payload.status),
            contentRating: mapContentRating(payload.content_rating)
        };

        if (typeof payload.default_thumbnail === "string" && payload.default_thumbnail !== "") {
            details.coverURL = payload.default_thumbnail;
        }
        var synopsis = stripHTML(payload.desc || payload.parsed || "");
        if (synopsis !== "") {
            details.synopsis = synopsis;
        }
        var altTitles = metadataList(payload.md_titles, "title");
        if (altTitles.length > 0) {
            details.altTitles = altTitles;
        }
        var genres = Array.isArray(payload.md_comic_md_genres) ? payload.md_comic_md_genres : [];
        var tags = genres
            .map(function (entry) {
                return entry && entry.md_genres ? entry.md_genres : null;
            })
            .filter(function (genre) {
                return genre && genre.group === "Genre" && typeof genre.name === "string";
            })
            .map(function (genre) {
                return genre.name;
            });
        if (tags.length > 0) {
            details.tags = tags;
        }
        details.attribution = { siteName: ctx.siteName, siteURL: ctx.baseURL };
        return details;
    }

    async function fetchChapters(ctx, key) {
        var origin = originOf(ctx && ctx.baseURL);
        var slug = seriesSlug(key);
        if (origin === "" || slug === "") {
            return [];
        }

        var chapters = [];
        var page = 1;
        var lastPage = 1;
        // A chapter list is paginated; 60 entries per page and a generous cap
        // keep a runaway series from issuing an unbounded number of requests.
        do {
            var payload = await requestJSON(
                origin +
                    "/api/comics/" +
                    encodeURIComponent(slug) +
                    "/chapter-list?page=" +
                    page
            );
            var data = payload && Array.isArray(payload.data) ? payload.data : [];
            chapters = chapters.concat(data);
            var pagination = payload && payload.pagination;
            var nextLast = pagination ? Number(pagination.last_page) : 1;
            lastPage = isFinite(nextLast) && nextLast >= 1 ? nextLast : 1;
            page += 1;
        } while (page <= lastPage && page <= 40);

        return chapters
            .filter(function (item) {
                return item && item.hid && item.chap !== null && item.chap !== undefined;
            })
            .map(function (item) {
                var chapter = {
                    key: chapterURL(origin, slug, item),
                    title: String(item.title || "Chapter " + item.chap),
                    language: item.lang || undefined,
                    group: item.group_name || undefined
                };
                var number = chapterNumber(item.chap);
                if (number !== undefined) {
                    chapter.number = number;
                }
                var published = item.publish_at || item.created_at;
                if (typeof published === "string" && published !== "") {
                    chapter.publishedAt = published;
                }
                return chapter;
            })
            .sort(function (left, right) {
                var a = left.number === undefined ? Infinity : left.number;
                var b = right.number === undefined ? Infinity : right.number;
                return a - b;
            });
    }

    var BlankGrimoireRuntime = {
        id: "theme.alpinegrid",
        name: "Alpine Grid Theme",
        version: "__ADAPTER_VERSION__",
        apiVersion: 1,

        detectionSignature: {
            selectors: [
                // Alpine binds the theme loader on the root element.
                '[x-data^="Utils.loadTheme"]',
                // Series and chapter payloads, one script per page kind.
                "script#comic-data",
                "script#sv-data",
                ".comic-desc"
            ],
            // Laravel's Vite entry point.
            scriptSrc: ["/build/assets/app-"],
            minScore: 30
        },

        selectors: {
            search: {
                path: "/search",
                item: ".result",
                title: ".result-title",
                link: "a"
            },
            details: {
                title: "h1",
                status: "",
                contentRating: ""
            },
            chapters: {
                item: ".chapter",
                link: "a",
                order: "asc"
            },
            pages: {
                strategies: [
                    {
                        // The chapter page embeds its pages in a JSON script:
                        // `{ "chapter": { ... }, "images": [ { "url": ... } ] }`.
                        kind: "scriptJSON",
                        pattern: '"images"',
                        path: "images"
                    }
                ]
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
