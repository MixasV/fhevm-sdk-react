# Changesets

This folder contains changeset files for managing package versions and changelogs.

## How to use

When you make changes to packages:

1. Run `pnpm changeset` to create a new changeset
2. Select the packages that changed
3. Select the type of change (major, minor, patch)
4. Describe the changes
5. Commit the changeset file with your changes

When ready to release:

1. Run `pnpm version` to version packages
2. Run `pnpm release` to publish to npm

See https://github.com/changesets/changesets for more information.
