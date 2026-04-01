# Development workflow

## Overview

This repository uses TypeScript (`NodeNext`), `mocha` for unit tests, ESLint with the oclif config, and GitHub Actions workflows for test and publish automation.

## Prerequisites

- Node.js `>=18.0.0` (from `package.json` `engines.node`)
- npm

## Configuration

### TypeScript

TypeScript compilation is configured in `tsconfig.json`:

- `module`: `NodeNext`
- `target`: `es2022`
- `outDir`: `dist`
- `rootDir`: `src`

### Tests

`mocha` configuration is defined in `.mocharc.json`:

- `require`: `ts-node/register`
- `node-option`:
  - `loader=ts-node/esm`
  - `experimental-specifier-resolution=node`
- `timeout`: `60000`

The test TypeScript configuration extends the root config (`test/tsconfig.json`) and sets:

- `compilerOptions.noEmit`: `true`

### Linting and formatting

ESLint is configured in `eslint.config.mjs`:

- Ignores are imported from `.gitignore` via `includeIgnoreFile(...)`.
- Config presets include `eslint-config-oclif` and `eslint-config-prettier`.

Prettier configuration is inherited from `@oclif/prettier-config` (see `.prettierrc.json`).

## Implementation

### Run unit tests

1. Install dependencies.

   ```sh
   npm install
   ```

2. Build the project.

   ```sh
   npm run build
   ```

3. Run tests.

   ```sh
   npm run test
   ```

GitHub Actions mirrors this flow in `.github/workflows/test.yml`.

### Debug the CLI in VS Code

VS Code launch configurations are defined in `.vscode/launch.json`.

- **Execute Command** launches `node` with `ts-node/esm` and runs `bin/dev.js`.
- **Attach** connects a debugger to port `9229`.

## Reference

- Test workflow: `.github/workflows/test.yml`
- Publish workflow: `.github/workflows/onRelease.yml`