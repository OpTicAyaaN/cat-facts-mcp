# cat-facts-mcp

An MCP server that exposes tools backed by Layer's `mcp/tools` API.

## Overview

`cat-facts-mcp` starts an MCP server over `stdio`.

At runtime, the server:

- Lists tools by calling `GET /mcp/tools` and then prepending an additional tool named `search_workflows_and_docs`.
- Calls tools by forwarding requests to `POST /mcp/tools/call`.
- Handles `search_workflows_and_docs` by calling `POST /chat/search`.

## Documentation

- [Tool catalog and invocation model](./docs/tools.md)
- [Tools showcase](./docs/showcase.md)
- [Run the server (local or installed)](./docs/running.md)

## Reference

- Package name: `cat-facts-mcp`
- Published binary: `cat-facts-mcp` (from `package.json` `bin`)
- oclif command name: `mcp` (from `package.json` `oclif.bin`)
