# TypeScript Library Starter

## Introduction

TypeScript library starter for the Micro:bit Educational Foundation.

This project is designed as a starting point for creating new projects and so doesn't do anything useful itself.

## Releases

We use GitHub packages for private packages and NPMJS for public packages.
You'll need to choose from the options in the CircleCI config and update
package.json to use @microbit-foundation (private) or @microbit (public)
scopes accordingly.

### Public packages

This project deploys releases to NPM via CircleCI for version tags. (e.g. v1.0.0).
This requires the `NPM_AUTH_TOKEN` environment variable to be available to the
build.

As the project uses a scope, the published packages are private by default.
To change this set the access to public when pushing (or in `.npmrc`).

Distinct semver versions are generated for branches, so it is safe to extend
the CI config to push all builds to NPM if this is helpful.

### Private packages

This project deploys releases to GitHub packages via CircleCI for version tags.
(e.g. v1.0.0). This requires the `GITHUB_TOKEN` environment variable to be
available to the build.

### Process

Steps:

1. Ensure master is up-to-date and has no local changes.
1. Update CHANGELOG.md, moving content from unreleased to the new version.
1. Tag the new version `git tag -a v1.0.0`. Use the changelog text as the
   message.
1. Push the new tag, `git push origin v1.0.0`.
1. The CI build will push `@microbit-foundation/typescript-library-starter@1.0.0`

## Development details

Stack:

- [Rollup](https://rollupjs.org/) for bundling
- [Jest](https://jestjs.io/) for testing
- [Prettier](https://prettier.io/) for automated code formatting (integrated with VS Code)
- [TSLint](https://palantir.github.io/tslint/) for linting

Outputs:

- `dist/es5` referenced from the package.json module field. This is ES5 with export/import suitable for use with Rollup/Webpack.
- `dist/bundles/index.umd.js` A UMD bundle. This is suitable for use in the browser and is referenced as `main` in `package.json`. We could easily build more/different bundles if there was demand (e.g. minimised, cjs).

## Initializing your project

Customise `package.json`. There should be no other references to the project name.

## Depending on projects created with this project

### Node

Add a dependency with npm, e.g. `npm install --save @microbit-foundation/typescript-library-starter`.

You can then import it as usual:

```javascript
const { fib } = require('@microbit-foundation/typescript-library-starter');

console.log(fib(8));
```

### Browser

Use a script tag to import the UMD bundle containing the library:

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Library demo</title>
  <script src="https://unpkg.com/@microbit-foundation/typescript-library-starter@0.0.0/dist/bundles/index.umd.js"></script>
</head>
<body>
<button onclick="javascript:alert(TypescriptLibraryStarter.fib(8))">Calculate fib(8)</button>
</body>
</html>
```

You can also download the JavaScript file to store alongside your own HTML page rather than using [unpkg](https://unpkg.com).

## Credits

This starter was derived from https://github.com/Hotell/typescript-lib-starter. It has since been significantly trimmed down, so if you're looking for more functionality that's a good place to start.
