# `theme.angular-ssr`

Generic adapter for Angular applications that server-render series catalog,
series, chapter, and reader pages. It does not depend on a site domain.

The adapter expects:

- `/browse?q={query}` for search;
- `.bc` cards with `.bc-title` and `.bc-img`;
- `.series-title`, `.cover-img`, `.description`, `.genre-tag`, and
  `.badge--status` on series pages;
- `.cl-row` chapter links;
- `.r-page-img` reader images.

It is intended for sites where Angular has already rendered the relevant
content into the HTML supplied to the adapter. A visible browser challenge is
still handled by the host application, not by adapter code.
