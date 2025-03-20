import {JSONSchema7} from 'json-schema';

export type LayerEnvironment = 'development' | 'production' | 'staging';

export interface Tool {
    description?: string;
    inputSchema: JSONSchema7;
    name: string;
    url?: string;
}

export interface SearchResult {
    name: string;
    type: string;
    url?: string;
    value: string;
}

export interface FlaggableAuthDetails {
    description?: string;
    name: string;
}