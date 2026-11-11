# `theme.next-reader`

Generic adapter for Next.js sites that expose catalog and series pages and
render chapter pages as ordered images.

It expects:

- `/search?q={query}` for search;
- series links containing `/series/comic/`;
- chapter links containing `/chapter/`;
- reader images with an accessible `alt` beginning with `Page `.

All paths are resolved relative to the user-selected site. Interactive
challenges and access-controlled chapters are handled by the host application
and are not bypassed by this adapter.
