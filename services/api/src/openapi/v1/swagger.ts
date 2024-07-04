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
                        description: 'The UUID of the model.',
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
                        description: 'The UUID of the model.',
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
            Model: {
                type: 'object',
                required: [],
                properties: {},
            },
            ModelClassificationRequestJson: {
                type: 'array',
                description: 'The classification data in JSON format.',
                items: {
                    type: 'object',
                },
                example: [
                    {
                        Time: 1575244800000,
                        Rainfall: 40.8,
                        'Rainfall (previous month)': 40.6,
                        Temperature: 6,
                        'Temperature (previous month)': 5.2,
                    },
                    {
                        Time: 959990400000,
                        Rainfall: 61.8,
                        'Rainfall (previous month)': 60.7,
                        Temperature: 16.4,
                        'Temperature (previous month)': 15.5,
                    },
                ],
            },
            ModelClassificationRequestCsv: {
                type: 'string',
                description: `The classification data in CSV format, where the first row contains
                    the attribute names and the following rows contain the data points.
                    Fields must be separated by commas.`,
                example: `Time,Rainfall,Rainfall (previous month),Temperature,Temperature (previous month)
1575244800000,40.8,40.6,6,5.2
959990400000,61.8,60.7,16.4,15.5`,
            },
            ModelClassificationResponse: {
                type: 'object',
                required: ['status', 'errors'],
                properties: {
                    classifications: {
                        type: 'array',
                        items: {
                            type: 'number',
                        },
                        description:
                            'An array containing as many integers are there are datapoints in the input dataset. For each `i`, `classifications[i]` is the number of the initial state whose centroid was closest to the `i`th datapoint of the input dataset. This attribute is present only if `status == "ok"`.',
                        example: [2, 7],
                    },
                    status: {
                        type: 'string',
                        enum: ['ok', 'error'],
                        description: 'The status of the classification.',
                        example: 'ok',
                    },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description: 'An array of error messages, if any.',
                        example: ['Invalid data format.'],
                    },
                },
            },
            ModelBuildRequest: {
                type: 'object',
                required: ['name', 'dataset', 'dataSource', 'config'],
                properties: {
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
                    public: {
                        type: 'boolean',
                        description: 'Indicates if the model is public.',
                        example: false,
                    },
                    dataSource: {
                        type: 'object',
                        required: ['format', 'data'],
                        properties: {
                            format: {
                                type: 'string',
                                enum: ['csv', 'json'],
                                description: 'The format of the data.',
                                example: 'csv',
                            },
                            fieldSep: {
                                type: 'string',
                                enum: [',', ';'],
                                description:
                                    'The field separator character used in the CSV data. The default value is `","`.',
                                example: ',',
                            },
                            data: {
                                type: 'string | array',
                                description:
                                    'The data used to train the model. If `type == "csv"`, the value of `data` should be a string containing the entire contents of the input CSV data (alternatively, it may be an array of strings, each representing one line of the input CSV data).  If `type == "json"`, the value of `data` must be a JSON array, each element of which must be a JSON object representing one data point.',
                                example: `Time,Rainfall,Rainfall (previous month),Temperature,Temperature (previous month)
1575244800000,40.8,40.6,6,5.2
959990400000,61.8,60.7,16.4,15.5`,
                            },
                        },
                    },
                    config: {
                        type: 'object',
                        required: ['name', 'numInitialStates', 'attributes', 'ops'],
                        properties: {
                            numInitialStates: {
                                type: 'number',
                                description:
                                    'An integer specifying the number of initial states that the data points are clustered into.',
                                example: 12,
                            },
                            numHistogramBuckets: {
                                type: 'number',
                                description:
                                    'The number of buckets in each of the histograms that are returned in the response object to show the distribution of attribute values in each state. The default value is 10.',
                                example: 10,
                            },
                            attributes: {
                                type: 'array',
                                description:
                                    'An array of objects describing the attributes of the input data.',
                                items: {
                                    type: 'object',
                                    required: ['name', 'source', 'type'],
                                    properties: {
                                        name: {
                                            type: 'string',
                                            description: 'The name of the attribute.',
                                            example: 'Rainfall',
                                        },
                                        source: {
                                            type: 'string',
                                            enum: ['input', 'synthetic'],
                                            description:
                                                'This must be either `"input"` (meaning that the attribute is to be read from the input data) or `"synthetic"` (meaning that the attribute does not appear in the input data and will be calculated by one of the post-input operations defined in `config.ops`).  Default value: `"input"`. It is generally not necessary to declare synthetic attributes in `config.attrs` because the post-input operations will add them with reasonable default settings (such as type and subtype); but you can declare a synthetic attribute here if you wish to customize its attributes (e.g. by specifying a `label` or a `distWeight`).',
                                            example: 'input',
                                        },
                                        sourceName: {
                                            type: 'string',
                                            description:
                                                'Optional (if missing, the same value as `name` is used). This is the name under which the attribute appears in the input data. If the input data is in the CSV format, this name appears in the header of the corresponding column. If the input data is in the JSON format, this name is used to represent this attribute in the JSON objects that represent individual data points.',
                                            example: 'Rainfall',
                                        },
                                        label: {
                                            type: 'string',
                                            description:
                                                'Optional (if missing, the same value as `name` is used). This is a user-friendly label for this attribute. This might eventually be used in string descriptions/representations in the model, constructed by the server and intended to be visible to the end-user.',
                                            example: 'Rainfall',
                                        },
                                        distWeight: {
                                            type: 'number',
                                            description:
                                                "The weight of this attribute for the purposes of distance calculations: `d(x, y) = sum_i w_i (x_i - y_i)^2`, where `w_i` is the `distWeight` of the `i`'th attribute. This attribute is optional; if absent, `1 / (variance of this attribute)` is used as the default, which is equivalent to rescaling each attribute so that it has a standard deviation of 1.",
                                            example: 1,
                                        },
                                        type: {
                                            type: 'string',
                                            enum: ['time', 'numeric', 'categorical', 'text'],
                                            description: 'The type of the attribute.',
                                            example: 'number',
                                        },
                                        subType: {
                                            type: 'string',
                                            enum: ['string', 'float', 'integer'],
                                            description:
                                                'Together with `type`, this defines how the values of this attribute are represented in the input data. If omitted, a default value is used depending on `type` (if `type` is `"numeric"`, the default `subType` is `"float"`, otherwise it\'s `"string"`).',
                                            example: 'float',
                                        },
                                        timeType: {
                                            type: 'string',
                                            enum: ['time', 'float', 'int'],
                                            description:
                                                'Only used if `type == "time"`. This value specifies if the attribute is a true timestamp or merely a scalar value which allows the data points to be ordered but does not actually represent a timestamp (i.e. it does not represent a specific day, month etc.). The default value is `"time"`.',
                                            example: 'time',
                                        },
                                    },
                                },
                                example: [
                                    {
                                        name: 'Time',
                                        source: 'input',
                                        type: 'time',
                                        subType: 'integer',
                                        timeType: 'time',
                                    },
                                    {
                                        name: 'Rainfall',
                                        source: 'input',
                                        type: 'numeric',
                                        subType: 'float',
                                    },
                                    {
                                        name: 'Rainfall (previous month)',
                                        source: 'input',
                                        type: 'numeric',
                                        subType: 'float',
                                    },
                                    {
                                        name: 'Temperature',
                                        source: 'input',
                                        type: 'numeric',
                                        subType: 'float',
                                    },
                                    {
                                        name: 'Temperature (previous month)',
                                        source: 'input',
                                        type: 'numeric',
                                        subType: 'float',
                                    },
                                ],
                            },
                            ops: {
                                type: 'array',
                                description:
                                    'An array of objects describing the operations that are to be applied to the input data before the clustering into initial states. Examples of such operations include: applying a linear transformation to an attribute; adding a time-shifted copy of an attribute; adding a categorical attribute representing the day-of-week based on the timestamp of the same instance; etc.',
                                items: {
                                    type: 'object',
                                    required: ['type', 'attribute'],
                                    properties: {
                                        op: {
                                            type: 'string',
                                            enum: ['timeShift', 'timeDelta', 'linTrend'],
                                            description: 'The type of the operation.',
                                            example: 'timeDelta',
                                        },
                                        inAttr: {
                                            type: 'string',
                                            description:
                                                'The name of the input attribute. This must be a numeric attribute.',
                                            example: 'Rainfall',
                                        },
                                        outAttr: {
                                            type: 'string',
                                            description:
                                                'The name of the output attribute. If no such attribute is defined in `config.attrs`, the modelling service will create one with suitable default settings.',
                                            example: 'Rainfall derivative',
                                        },
                                        windowUnit: {
                                            type: 'string',
                                            enum: [
                                                'samples',
                                                'numeric',
                                                'sec',
                                                'min',
                                                'hour',
                                                'day',
                                            ],
                                            description:
                                                'The unit used to define the window size (`w` in the discussion above).  Possible values: - `windowUnit = "samples"`: the window is defined as consisting of a certain number of input samples; no time attribute is needed. - `windowUnit = "numeric"`: the time attribute is assumed to be a purely numeric value and not a true timestamp (i.e. its `timeType` is `"int"` or `"float"`, not `"time"`); the window is defined as a range of a fixed length on this numeric time axis, i.e. the window that ends at timepoint `t` covers all timepoints `u` for which `t - w <= u <= t`, where `w` is the window size. - `windowUnit = "sec"`: the time attribute is assumed to be a true timestamp (i.e. its `timeType` is `"time"`), and the window size will be specified in seconds. - `windowUnit = "min"`, `"hour"`, `"day"`: like `"sec"` except that the window size will be specified in minutes, hours, or days, respectively.',
                                            example: 'samples',
                                        },
                                        timeAttr: {
                                            type: 'string',
                                            description:
                                                'The name of the time attribute used to determine the time `t` of each input sample.  If this value is omitted, the first attribute whose type is `time` will be used.  If `windowUnit == "samples"`, no time attribute is needed.',
                                            example: 'Time',
                                        },
                                        windowSize: {
                                            type: 'number',
                                            description:
                                                'A number (integer or floating-point) specifying the window size in the units indicated by `windowUnit`.',
                                            example: 1,
                                        },
                                    },
                                },
                                example: [
                                    {
                                        op: 'timeDelta',
                                        inAttr: 'Rainfall',
                                        outAttr: 'Rainfall derivative',
                                        windowUnit: 'samples',
                                        // timeAttr: 'Time',
                                        windowSize: 1,
                                    },
                                    {
                                        op: 'timeDelta',
                                        inAttr: 'Rainfall (previous month)',
                                        outAttr: 'Rainfall (previous month) derivative',
                                        windowUnit: 'samples',
                                        // timeAttr: 'Time',
                                        windowSize: 1,
                                    },
                                    {
                                        op: 'timeDelta',
                                        inAttr: 'Temperature',
                                        outAttr: 'Temperature derivative',
                                        windowUnit: 'samples',
                                        // timeAttr: 'Time',
                                        windowSize: 1,
                                    },
                                    {
                                        op: 'timeDelta',
                                        inAttr: 'Temperature (previous month)',
                                        outAttr: 'Temperature (previous month) derivative',
                                        windowUnit: 'samples',
                                        // timeAttr: 'Time',
                                        windowSize: 1,
                                    },
                                ],
                            },
                            decTree_maxDepth: {
                                type: 'number',
                                description:
                                    'The maximum depth of the decision tree; a negative value means that the depth of the tree is not limited. The default value is 3.',
                                example: 5,
                            },
                            decTree_minEntropyToSplit: {
                                type: 'number',
                                description:
                                    'A node is not going to be split further if its entropy is less than this many bits.  The default value is the entropy of the distribution (*p*, 1 - *p*), where *p* = 1 / (3 * `numInitialStates`).',
                                example: 0.1,
                            },
                            decTree_minNormInfGainToSplit: {
                                type: 'number',
                                description:
                                    'A node is not going to be split further if the normalized information gain of the best split is less than this value. The default value is 0.',
                                example: 0.1,
                            },
                            ignoreConversionErrors: {
                                type: 'boolean',
                                description:
                                    'A boolean value specifying how to deal with conversion errors (and missing values) when reading the input data.  If `true`, any input row containing a conversion error is skipped and the processing continues with the next row; if `false`, processing is aborted on the first error (and no model is built). The default value is `true`.',
                                example: false,
                            },
                            distWeightOutliers: {
                                type: 'number',
                                description:
                                    'When calculating the value of `distWeight` for attributes that do not have a `distWeight` defined explicitly in their attribute specification, the variance of the attribute is calculated over all the values of this attribute except the highest and lowest `distWeightOutliers / 2 * 100` percent of them, the idea being that these might be outliers that would skew the result too much. The default value is `distWeightOutliers = 0.05`, meaning that the highest and lowest 2.5% of the values of an attribute are ignored when calculating its variance for the purposes of calculating the default `distWeight` of that attribute.',
                                example: 0.05,
                            },
                            includeHistograms: {
                                type: 'boolean',
                                description:
                                    'A boolean value specifying whether histograms should be calculated and included in the result object. The default value is `true`.',
                                example: false,
                            },
                            includeDecisionTrees: {
                                type: 'boolean',
                                description:
                                    'A boolean value specifying whether decision trees should be calculated and included in the result object. The default value is `true`.',
                                example: false,
                            },
                            includeStateHistory: {
                                type: 'boolean',
                                description:
                                    'A boolean value specifying whether the state history should be calculated and included in the result object. The default value is `true`.',
                                example: false,
                            },
                        },
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
        },
        '/models/{uuid}': {
            get: {
                tags: ['Models'],
                summary: 'Get model by UUID',
                description: 'Get a specific model by its UUID.',
                parameters: [
                    {
                        name: 'uuid',
                        in: 'path',
                        description: 'The UUID of the model.',
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
            //     description: 'Update a specific model by its UUID.',
            //     parameters: [
            //         {
            //             name: 'uuid',
            //             in: 'path',
            //             description: 'The UUID of the model.',
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
                description: 'Delete a specific model by its UUID.',
                parameters: [
                    {
                        name: 'uuid',
                        in: 'path',
                        description: 'The UUID of the model.',
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
        '/models/{uuid}/classification': {
            post: {
                tags: ['Models'],
                summary: 'Get data classification',
                description: 'Get classification of the given data for a model with given UUID.',
                parameters: [
                    {
                        name: 'uuid',
                        in: 'path',
                        description: 'The UUID of the model.',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                requestBody: {
                    description: `The data to classify. The attribute names must match the attribute
                    names used to train the model.`,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ModelClassificationRequestJson',
                            },
                        },
                        'text/csv': {
                            schema: {
                                $ref: '#/components/schemas/ModelClassificationRequestCsv',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'The classification result of the data by the model.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ModelClassificationResponse',
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
        },
        '/models/build': {
            post: {
                tags: ['Models'],
                description: 'Build a new model from given configuration and data.',
                summary: 'Build a new model',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ModelBuildRequest',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'The created model',
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
                },
            },
        },
    },
};
