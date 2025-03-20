import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    CallToolResultSchema,
    ListToolsRequestSchema,
    ListToolsResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {z} from 'zod';

import LayerAPI from './layer-api.js';

export default class MCPServer extends Server {
    private readonly api: LayerAPI;

    constructor(name: string, version: string, api: LayerAPI) {
        super(
            {
                name,
                version,
            },
            {
                capabilities: {
                    tools: {},
                },
            },
        );

        this.api = api;

        this.setRequestHandler(
            ListToolsRequestSchema,
            async (): Promise<z.infer<typeof ListToolsResultSchema>> => ({
                tools: await this.api.getAllTools(),
            }),
        );

        this.setRequestHandler(
            CallToolRequestSchema,
            async (request: z.infer<typeof CallToolRequestSchema>): Promise<z.infer<typeof CallToolResultSchema>> =>
                this.api.callTool({arguments: request.params.arguments, name: request.params.name}),
        );
    }

    public async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.connect(transport);
        console.error('Server running on stdio!');
    }
}