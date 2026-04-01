# Run the server

## Overview

`cat-facts-mcp` runs an MCP server over `stdio` using the Model Context Protocol TypeScript SDK.

## Prerequisites

- Node.js `>=18.0.0`
- A Layer API key (sent as `Layer-Api-Key`)

## Implementation

### Install and run as a global package

1. Install the package.

   ```sh
   npm install -g cat-facts-mcp
   ```

2. Start the server.

   ```sh
   cat-facts-mcp
   ```

   The entrypoint executes the oclif command defined in `dist/index.js`.

### Run from a local checkout

1. Install dependencies.

   ```sh
   npm install
   ```

2. Build TypeScript into `dist/`.

   ```sh
   npm run build
   ```

3. Start the server.

   ```sh
   node ./bin/run.js
   ```

## Configuration

### Environment and API key

The server constructs a `LayerAPI` client using constants from `src/vars.ts`:

- `environment`: `production`
- `layerApiKey`: a literal string value

## Troubleshooting

### Tool call fails with an error message string

`got` request errors are returned as MCP tool results with `isError: true` and the error message as a text content item.
