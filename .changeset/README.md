# Changesets

Every pull request that changes an adapter package must include a changeset:

```bash
pnpm changeset
```

The release workflow opens a version pull request. When that pull request is
merged, the publication is rebuilt, deployed to GitHub Pages, and only then
tagged with `<adapter-id>@<version>`.

Do not edit adapter versions or package `CHANGELOG.md` files by hand.
