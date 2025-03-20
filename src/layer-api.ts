import {CallToolResultSchema, ToolSchema} from '@modelcontextprotocol/sdk/types.js';
import Ajv from 'ajv';
import {got, RequestError} from 'got';
import {z} from 'zod';

import {LayerEnvironment, SearchResult, Tool} from './types.js';
import {addDefaultsToSchema} from './utils.js';

export default class LayerAPI {
    private readonly ajv = new Ajv({useDefaults: true});
    private readonly baseUrl: string;
    private readonly layerApiKey: string;
    private readonly overrides: Record<string, string>;
    private readonly searchTool: Tool = {
        description: 'ALWAYS EXECUTE THIS TOOL FIRST UNLESS THE TOOL TO BE USED IS OBVIOUS. It will return relevant workflows and documentation based on the user\'s query.',
        inputSchema: {
            '$defs': {
                FunctionCall: {
                    properties: {
                        arguments: {
                            title: 'Arguments',
                            type: 'string',
                        },
                        name: {
                            title: 'Name',
                            type: 'string',
                        },
                    },
                    required: [
                        'name',
                        'arguments',
                    ],
                    title: 'FunctionCall',
                    type: 'object',
                },
                Message: {
                    properties: {
                        content: {
                            anyOf: [
                                {
                                    type: 'string',
                                },
                                {
                                    type: 'null',
                                },
                            ],
                            title: 'Content',
                        },
                        role: {
                            '$ref': '#/$defs/MessageRole',
                        },
                        // eslint-disable-next-line camelcase
                        tool_calls: {
                            anyOf: [
                                {
                                    items: {
                                        '$ref': '#/$defs/schemas__tools__openai__ToolCall',
                                    },
                                    type: 'array',
                                },
                                {
                                    type: 'null',
                                },
                            ],
                            title: 'Tool Calls',
                        },
                    },
                    required: [
                        'role',
                    ],
                    title: 'Message',
                    type: 'object',
                },
                MessageRole: {
                    enum: [
                        'assistant',
                        'user',
                        'system',
                        'tool',
                    ],
                    title: 'MessageRole',
                    type: 'string',
                },
                'schemas__tools__openai__ToolCall': {
                    properties: {
                        function: {
                            '$ref': '#/$defs/FunctionCall',
                        },
                        'id': {
                            title: 'Id',
                            type: 'string',
                        },
                        type: {
                            const: 'function',
                            default: 'function',
                            enum: [
                                'function',
                            ],
                            title: 'type',
                            type: 'string',
                        },
                    },
                    required: [
                        'id',
                        'function',
                    ],
                    title: 'ToolCall',
                    type: 'object',
                },
                ToolMessage: {
                    properties: {
                        content: {
                            title: 'Content',
                            type: 'string',
                        },
                        role: {
                            const: 'tool',
                            default: 'tool',
                            enum: [
                                'tool',
                            ],
                            title: 'Role',
                            type: 'string',
                        },
                        // eslint-disable-next-line camelcase
                        tool_call_id: {
                            title: 'Tool Call Id',
                            type: 'string',
                        },
                    },
                    required: [
                        'content',
                        'tool_call_id',
                    ],
                    title: 'ToolMessage',
                    type: 'object',
                },
            },
            additionalProperties: false,
            properties: {},
            required: ['body'],
            type: 'object',
        },
        name: 'search_workflows_and_docs',
    };
    private tools: Tool[] = [];

    constructor(
        layerApiKey: string, environment: LayerEnvironment = 'production', overrides: Record<string, string> = {},
    ) {
        this.layerApiKey = layerApiKey;

        switch (environment) {
            case 'development': {
                this.baseUrl = 'http://localhost';
                break;
            }

            case 'staging': {
                this.baseUrl = 'https://api.staging.buildwithlayer.com';
                break;
            }

            default: {
                this.baseUrl = 'https://api.buildwithlayer.com';
            }
        }

        this.overrides = overrides;
    }

    public async callTool(toolCall: {
        arguments?: Record<string, unknown> | undefined;
        name: string;
    }): Promise<z.infer<typeof CallToolResultSchema>> {
        const tool = this.tools.find(tool => tool.name === toolCall.name);
        if (!tool) throw new Error(`Tool '${toolCall.name}' is not available`);

        const validate = this.ajv.compile(tool.inputSchema);
        if (!validate(toolCall.arguments)) throw new Error(JSON.stringify(validate.errors));

        if (toolCall.name === this.searchTool.name) {
            try {
                const response = await got(`${this.baseUrl}/chat/search`, {
                    headers: {
                        Accept: 'application/json',
                        'Layer-Api-Key': this.layerApiKey,
                    },
                    json: toolCall.arguments,
                    method: 'POST',
                }).json<{ sources: SearchResult[] }>();

                return {
                    content: response.sources.map(source => ({
                        text: JSON.stringify(source),
                        type: 'text',
                    })),
                    isError: false,
                };
            } catch (error) {
                if (error instanceof RequestError) {
                    return {
                        content: [
                            {
                                text: error.message,
                                type: 'text',
                            },
                        ],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            text: `${error}`,
                            type: 'text',
                        },
                    ],
                };
            }
        }

        try {
            const response = await got(`${this.baseUrl}/mcp/tools/call`, {
                headers: {
                    'Layer-Api-Key': this.layerApiKey,
                },
                json: toolCall.arguments,
                method: 'POST',
            }).json();

            return {
                content: [{
                    text: JSON.stringify(response),
                    type: 'text',
                }],
                isError: false,
            };
        } catch (error) {
            if (error instanceof RequestError) {
                return {
                    content: [
                        {
                            text: error.message,
                            type: 'text',
                        },
                    ],
                    isError: true,
                };
            }

            return {
                content: [
                    {
                        text: `${error}`,
                        type: 'text',
                    },
                ],
            };
        }
    }

    public async getAllTools(): Promise<z.infer<typeof ToolSchema>[]> {
        const tools = await got(`${this.baseUrl}/mcp/tools`, {
            headers: {
                Accept: 'application/json',
                'Layer-Api-Key': this.layerApiKey,
            },
        }).json<Tool[]>();

        this.tools = [this.searchTool, ...tools];

        for (const tool of this.tools) {
            addDefaultsToSchema(tool.inputSchema, this.overrides);
        }

        return this.tools.map(tool => ToolSchema.parse(tool));
    }
}