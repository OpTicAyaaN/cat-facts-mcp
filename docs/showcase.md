# Tools showcase

## Overview

`cat-facts-mcp` runs an MCP server over `stdio` and exposes a catalog of tools.

The catalog contains:

- A built-in tool: `search_workflows_and_docs`
- Additional tools fetched from Layer: `GET /mcp/tools`

Tool execution is forwarded to Layer endpoints.

## Prerequisites

- Node.js `>=18.0.0` (from `package.json` `engines.node`)
- A running MCP client capable of:
  - listing tools (`tools/list`)
  - calling tools (`tools/call`)

## Tool catalog

### `search_workflows_and_docs`

The tool `search_workflows_and_docs` is always included in the tool list.

- `name`: `search_workflows_and_docs`
- Downstream endpoint: `POST /chat/search`

The tool call result returns one MCP text content item per search source.
Each text item contains a JSON-stringified `SearchResult` object (see `src/types.ts`).

### Layer-provided tools

Tools are fetched from Layer during `tools/list`.

- Downstream endpoint: `GET /mcp/tools`
- Tool type: `Tool` (see `src/types.ts`)

## Implementation

### List tools in the MCP client

1. Start the server (see [Run the server](./running.md)).
2. List tools using the MCP `tools/list` request.

The server returns:

- `search_workflows_and_docs`
- The full set of tools returned by Layer

### Call a tool

1. Select a tool name from `tools/list`.
2. Call the tool using the MCP `tools/call` request.

The server forwards the call as follows:

- `search_workflows_and_docs`  `POST /chat/search`
- Any other tool  `POST /mcp/tools/call`

## Best Practices

- Execute `search_workflows_and_docs` first when a request requires discovery of relevant workflows or documentation. The tool description is provided by the server and can be used as the primary guidance.

## Troubleshooting

### Tool call returns `isError: true`

`got` request errors are returned as MCP tool results with `isError: true` and the error message as a text content item.

## Reference

- MCP request handlers:
  - `tools/list` is handled by `LayerAPI.getAllTools()` (see `src/mcp-server.ts`)
  - `tools/call` is handled by `LayerAPI.callTool(...)` (see `src/mcp-server.ts`)
