import {JSONSchema7, JSONSchema7Definition} from 'json-schema';

type Overrides = Record<string, string>;
type MapOfSchemas = { [key: string]: JSONSchema7Definition; };
type Flags = {[p: string]: string} & {json: boolean | undefined};

function addDefaultsToMapOfSchemas(map: MapOfSchemas, overrides: Overrides) {
    for (const key of Object.keys(map)) {
        addDefaultsToSchema(map[key], overrides, key);
    }
}

function addDefaultsToArrayOfSchemas(array: JSONSchema7Definition[], overrides: Overrides) {
    for (const schema of array) {
        addDefaultsToSchema(schema, overrides);
    }
}

export function addDefaultsToSchema(schema: JSONSchema7Definition, overrides: Overrides, identifier?: string | undefined) {
    if (typeof schema === 'boolean') return;

    if (identifier !== undefined && schema.type === 'string' && identifier in overrides)
        schema.default = overrides[identifier];

    for (const fieldName of ['$defs', 'properties', 'patternProperties', 'definitions'] as (keyof JSONSchema7)[]) {
        const fieldValue = schema[fieldName];
        if (fieldValue === undefined) continue;
        addDefaultsToMapOfSchemas(fieldValue as MapOfSchemas, overrides);
    }

    for (const fieldName of ['allOf', 'anyOf', 'oneOf'] as (keyof JSONSchema7)[]) {
        const fieldValue = schema[fieldName];
        if (fieldValue === undefined) continue;
        addDefaultsToArrayOfSchemas(fieldValue as JSONSchema7Definition[], overrides);
    }

    for (const fieldName of ['additionalItems', 'contains', 'additionalProperties', 'propertyNames', 'if', 'then', 'else', 'not'] as (keyof JSONSchema7)[]) {
        const fieldValue = schema[fieldName];
        if (fieldValue === undefined) continue;
        addDefaultsToSchema(fieldValue as JSONSchema7Definition, overrides, fieldName);
    }

    if (Array.isArray(schema.items)) addDefaultsToArrayOfSchemas(schema.items, overrides);
    else if (schema.items !== undefined) addDefaultsToSchema(schema.items, overrides, 'items');

    if (schema.dependencies !== undefined) {
        for (const key of Object.keys(schema.dependencies)) {
            const value = schema.dependencies[key];
            if (Array.isArray(value)) continue;
            addDefaultsToSchema(value, overrides, key);
        }
    }

    if (schema.required !== undefined) {
        schema.required = schema.required.filter(p => !(p in overrides));
    }
}

export function getOverrides(flags: Flags): Record<string, string> {
    const overrides: Record<string, string> = {};
    for (const key of Object.keys(flags)) {
        overrides[key] = flags[key];
    }

    return overrides;
}