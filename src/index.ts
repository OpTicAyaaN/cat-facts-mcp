import {Command, Flags} from '@oclif/core';
import {OptionFlag} from '@oclif/core/interfaces';
import {createRequire} from 'node:module';

import LayerAPI from './layer-api.js';
import MCPServer from './mcp-server.js';
import {getOverrides} from './utils.js';
import {authFlaggableDetails, environment, layerApiKey} from './vars.js';

const packageJson = createRequire(import.meta.url)('../package.json');

const FLAGS: Record<string, OptionFlag<string | undefined>> = {};
for (const detail of authFlaggableDetails) {
    FLAGS[detail.name] = Flags.string({
        required: false,
        summary: detail.description,
    });
}

export default class MCP extends Command {
    static description = 'Start an MCP Server';
    static examples = [
        '<%= config.bin %>',
    ];
    static flags = FLAGS;

    async run(): Promise<void> {
        const {flags} = await this.parse(MCP);

        const overrides = getOverrides(flags);

        const api = new LayerAPI(layerApiKey, environment, overrides);
        const server = new MCPServer(packageJson.name, packageJson.version, api);

        await server.run();
    }
}
