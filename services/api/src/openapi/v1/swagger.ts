import config from '../../config';

export default {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'StreamStory public API',
        description: 'API for StreamStory based on OpenAPI 3.0 specification.',
        // termsOfService: 'http://sreamstory.ijs.si/terms',
        // contact: {
        //     name: 'StreamStory',
        //     url: 'http://streamstory.ijs.si',
        //     email: 'streamstory@ijs.si',
        // },
        // license: {
        //     name: 'Apache 2.0',
        //     url: 'http://apache.com',
        // },
    },
    servers: [
        {
            url: `${config.url}/api/v1`,
            description: process.env.NODE_ENV,
        },
    ],
    security: [{ apiKeyAuth: [] }],
    components: {
        securitySchemes: {
            apiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-api-key',
                description: 'Requests should pass a `x-api-key` header.',
            },
        },
        responses: {
            400: {
                description: 'Missing API key header `x-api-key` or invalid parameters.',
                contents: 'application/json',
                // content: {
                //     'application/json': {
                //         schema: {
                //             type: 'object',
                //             properties: {
                //                 error: {
                //                     type: 'string',
                //                     example:
                //                         'Missing API key header `x-api-key` or invalid parameters.',
                //                 },
                //             },
                //         },
                //     },
                // },
            },
            401: {
                description: 'Invalid API key.',
                contents: 'application/json',
                // content: {
                //     'application/json': {
                //         schema: {
                //             type: 'object',
                //             properties: {
                //                 error: {
                //                     type: 'string',
                //                     example: 'Invalid API key.',
                //                 },
                //             },
                //         },
                //     },
                // },
            },
            404: {
                description: 'The model does not exist.',
                contents: 'application/json',
                // content: {
                //     'application/json': {
                //         schema: {
                //             type: 'object',
                //             properties: {
                //                 error: {
                //                     type: 'string',
                //                     example: "The model with given UUID doesn't exist.",
                //                 },
                //             },
                //         },
                //     },
                // },
            },
        },
        schemas: {
            ModelInfo: {
                type: 'object',
                required: [
                    'uuid',
                    'name',
                    'description',
                    'dataset',
                    'username',
                    'public',
                    'online',
                    'active',
                    'createdAt',
                ],
                properties: {
                    uuid: {
                        type: 'string',
                        description: 'The universally unique identifier of the model.',
                        example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                    },
                    name: {
                        type: 'string',
                        description: 'The name of the model.',
                        example: 'Weather Example',
                    },
                    description: {
                        type: 'string',
                        description: 'A description of the model.',
                        example: 'Monthly rainfall and temperatures.',
                    },
                    dataset: {
                        type: 'string',
                        description: 'The name of the dataset used to train the model.',
                        example: 'weather.csv',
                    },
                    username: {
                        type: 'string',
                        description: 'The username of the model owner.',
                        example: 'streamstory@ijs.si',
                    },
                    public: {
                        type: 'boolean',
                        description: 'Indicates if the model is public.',
                        example: false,
                    },
                    online: {
                        type: 'boolean',
                        description: 'Indicates if the model is online.',
                        example: false,
                    },
                    active: {
                        type: 'boolean',
                        description:
                            'Indicates if the model is active. This is only relevant for online models.',
                        example: false,
                    },
                    createdAt: {
                        type: 'number',
                        description: 'The creation timestamp of the model.',
                        example: 1717382212904,
                    },
                },
            },
            ModelDetails: {
                type: 'object',
                required: [
                    'uuid',
                    'name',
                    'description',
                    'dataset',
                    'username',
                    'public',
                    'online',
                    'active',
                    'createdAt',
                    'model',
                ],
                properties: {
                    uuid: {
                        type: 'string',
                        description: 'The universally unique identifier of the model.',
                        example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                    },
                    name: {
                        type: 'string',
                        description: 'The name of the model.',
                        example: 'Weather Example',
                    },
                    description: {
                        type: 'string',
                        description: 'A description of the model.',
                        example: 'Monthly rainfall and temperatures.',
                    },
                    dataset: {
                        type: 'string',
                        description: 'The name of the dataset used to train the model.',
                        example: 'weather.csv',
                    },
                    username: {
                        type: 'string',
                        description: 'The username of the model owner.',
                        example: 'streamstory@ijs.si',
                    },
                    public: {
                        type: 'boolean',
                        description: 'Indicates if the model is public.',
                        example: false,
                    },
                    online: {
                        type: 'boolean',
                        description: 'Indicates if the model is online.',
                        example: false,
                    },
                    active: {
                        type: 'boolean',
                        description:
                            'Indicates if the model is active. This is only relevant for online models.',
                        example: false,
                    },
                    createdAt: {
                        type: 'number',
                        description: 'The creation timestamp of the model.',
                        example: 1717382212904,
                    },
                    model: {
                        type: 'object',
                        description: 'The model object',
                        // example: {
                        //     type: 'object',
                        //     required: ['scales', 'totalHistograms', 'stateHistoryTimes', 'stateHistoryInitialStates', 'config', 'dataset'],
                        //     properties: {
                        //         type: {
                        //             type: 'string',
                        //             description: 'The type of the model.',
                        //             example: 'RandomForest',
                        //         },
                        //         parameters: {
                        //             type: 'object',
                        //             description: 'The parameters of the model.',
                        //             example: {
                        //                 n_estimators: 100,
                        //                 max_depth: 10,
                        //             },
                        //         },
                        //     },
                        // },
                    },
                },
            },
        },
    },
    paths: {
        '/models': {
            get: {
                tags: ['Models'],
                summary: 'Get a list of models',
                description:
                    'Get a list of all available models. Available models include your own models and optionally models shared with you by other users and/or public models.',
                parameters: [
                    {
                        name: 'includeShared',
                        in: 'query',
                        description: 'Include models shared with you by other users.',
                        required: false,
                        schema: {
                            type: 'boolean',
                        },
                    },
                    {
                        name: 'includePublic',
                        in: 'query',
                        description: 'Include public models.',
                        required: false,
                        schema: {
                            type: 'boolean',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'A list of models',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/ModelInfo',
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        $ref: '#/components/responses/400',
                    },
                    '401': {
                        $ref: '#/components/responses/401',
                    },
                },
            },
            // post: {
            //     tags: ['Models'],
            //     description: 'Create a new model',
            //     security: [],
            //     requestBody: {
            //         content: {
            //             'application/json': {
            //                 schema: {
            //                     $ref: '#/components/schemas/Model',
            //                 },
            //             },
            //         },
            //     },
            //     responses: {
            //         '201': {
            //             description: 'The created model',
            //             content: {
            //                 'application/json': {
            //                     schema: {
            //                         $ref: '#/components/schemas/Model',
            //                     },
            //                 },
            //             },
            //         },
            //     },
            // },
        },
        '/models/{uuid}': {
            get: {
                tags: ['Models'],
                summary: 'Get model by UUID',
                description: 'Get a specific model by its universally unique identifier.',
                parameters: [
                    {
                        name: 'uuid',
                        in: 'path',
                        description: 'The universally unique identifier of the model.',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'The specified model.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ModelDetails',
                                },
                            },
                        },
                    },
                    '400': {
                        $ref: '#/components/responses/400',
                    },
                    '401': {
                        $ref: '#/components/responses/401',
                    },
                    '404': {
                        $ref: '#/components/responses/404',
                    },
                },
            },
            // put: {
            //     tags: ['Models'],
            //     description: 'Update a specific model by its universally unique identifier.',
            //     parameters: [
            //         {
            //             name: 'uuid',
            //             in: 'path',
            //             description: 'The universally unique identifier of the model.',
            //             required: true,
            //             schema: {
            //                 type: 'string',
            //             },
            //         },
            //     ],
            //     requestBody: {
            //         content: {
            //             'application/json': {
            //                 schema: {
            //                     $ref: '#/components/schemas/Model',
            //                 },
            //             },
            //         },
            //     },
            //     responses: {
            //         '200': {
            //             description: 'The updated model',
            //             content: {
            //                 'application/json': {
            //                     schema: {
            //                         $ref: '#/components/schemas/Model',
            //                     },
            //                 },
            //             },
            //         },
            //     },
            // },
            delete: {
                tags: ['Models'],
                summary: 'Delete model by UUID',
                description: 'Delete a specific model by its universally unique identifier.',
                parameters: [
                    {
                        name: 'uuid',
                        in: 'path',
                        description: 'The universally unique identifier of the model.',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '204': {
                        description: 'The model was successfully deleted.',
                    },
                    '400': {
                        $ref: '#/components/responses/400',
                    },
                    '401': {
                        $ref: '#/components/responses/401',
                    },
                    '404': {
                        $ref: '#/components/responses/404',
                    },
                },
            },
        },
    },
};
