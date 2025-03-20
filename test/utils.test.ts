import {expect} from 'chai';
import {JSONSchema7Definition} from 'json-schema';

import {addDefaultsToSchema} from '../src/utils.js';

describe('addDefaultsToSchema', () => {
    it('fills defaults for a schema', async () => {
        const schema: JSONSchema7Definition = {
            'additionalProperties': false,
            'properties': {
                'auth': {
                    'oneOf': [
                        {
                            'properties': {
                                'Authorization': {
                                    'description': 'The Checkly Public API uses API keys to authenticate requests. You can get the API Key <a href="https://app.checklyhq.com/settings/user/api-keys" target="_blank">here</a>.</br>Your API key is like a password: <br>keep it secure!</br></br>Authentication to the API is performed using the Bearer auth method in the Authorization header and using the account ID.</br></br>For example, set <b>Authorization</b> header while using cURL: <code>curl -H "Authorization: Bearer [apiKey]" "X-Checkly-Account: [accountId]"</code></br>',
                                    'type': 'string',
                                },
                            },
                            'required': [
                                'Authorization',
                            ],
                        },
                        {
                            'properties': {
                                'x-checkly-account': {
                                    'description': 'Your Checkly account ID, you can find it at https://app.checklyhq.com/settings/account/general',
                                    'type': 'string',
                                },
                            },
                            'required': [
                                'x-checkly-account',
                            ],
                        },
                    ],
                    'type': 'object',
                },
            },
            'required': [
                'auth',
            ],
            'type': 'object',
        };
        const overrides: Record<string, string> = {'x-checkly-account': '0123456789'};
        addDefaultsToSchema(schema, overrides);
        expect(schema).deep.equal({
            'additionalProperties': false,
            'properties': {
                'auth': {
                    'oneOf': [
                        {
                            'properties': {
                                'Authorization': {
                                    'description': 'The Checkly Public API uses API keys to authenticate requests. You can get the API Key <a href="https://app.checklyhq.com/settings/user/api-keys" target="_blank">here</a>.</br>Your API key is like a password: <br>keep it secure!</br></br>Authentication to the API is performed using the Bearer auth method in the Authorization header and using the account ID.</br></br>For example, set <b>Authorization</b> header while using cURL: <code>curl -H "Authorization: Bearer [apiKey]" "X-Checkly-Account: [accountId]"</code></br>',
                                    'type': 'string',
                                },
                            },
                            'required': [
                                'Authorization',
                            ],
                        },
                        {
                            'properties': {
                                'x-checkly-account': {
                                    'default': '0123456789',
                                    'description': 'Your Checkly account ID, you can find it at https://app.checklyhq.com/settings/account/general',
                                    'type': 'string',
                                },
                            },
                            'required': [
                                'x-checkly-account',
                            ],
                        },
                    ],
                    'type': 'object',
                },
            },
            'required': [
                'auth',
            ],
            'type': 'object',
        });
    });
});
