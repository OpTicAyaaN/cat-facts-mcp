# Tool catalog and invocation model

## Overview

`cat-facts-mcp` exposes MCP tools sourced from Layer and a single built-in search tool.

## Prerequisites

- Node.js `>=18.0.0` (from `package.json` `engines.node`)

## Tool list

### `search_workflows_and_docs`

The server always includes a tool named `search_workflows_and_docs`.

- `name`: `search_workflows_and_docs`
- `description`: `ALWAYS EXECUTE THIS TOOL FIRST UNLESS THE TOOL TO BE USED IS OBVIOUS. It will return relevant workflows and documentation based on the user's query.`
- Implementation: `POST /chat/search`

The tool response returns a list of `sources` (typed as `SearchResult[]` in `src/types.ts`). Each source is returned as a text content item with the source JSON stringified.

### Layer-provided tools

At startup, the server retrieves tools from Layer:

- Endpoint: `GET /mcp/tools`
- Parsed type: `Tool[]` (see `src/types.ts`)

Each returned tool is validated before being returned from MCP `tools/list`:

- Validation: `ToolSchema.parse(tool)` (from `@modelcontextprotocol/sdk/types`)

## Tool invocation

### Calling `search_workflows_and_docs`

Calls to `search_workflows_and_docs` are sent to:

- Endpoint: `POST /chat/search`
- Request headers:
  - `Accept: application/json`
  - `Layer-Api-Key: <layer api key>`

### Calling other tools

Calls to other tools are sent to:

- Endpoint: `POST /mcp/tools/call`
- Request headers:
  - `Layer-Api-Key: <layer api key>`

The response body is stringified into a single MCP text content item.

## Input schema behavior

Before sending a tool call, the server validates tool inputs using `ajv` with defaults enabled:

- `new Ajv({useDefaults: true})`

The server also edits tool JSON Schemas before returning them, by applying overrides:

- `addDefaultsToSchema(tool.inputSchema, overrides)`

In `addDefaultsToSchema`:

- Any overridden string schema gets `schema.default = overrides[identifier]`.
- Any overridden required field is removed from `schema.required`.

## Reference

- MCP request handlers:
  - `tools/list` → `LayerAPI.getAllTools()` (see `src/mcp-server.ts`)
  - `tools/call` → `LayerAPI.callTool(...)` (see `src/mcp-server.ts`)
