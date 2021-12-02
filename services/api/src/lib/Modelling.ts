import fs from 'fs';
import { once } from 'events';
import readline from 'readline';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import csvParse from 'csv-parse/lib/sync';

import { isNumeric } from '../utils/misc';

export interface ModelConfig {
    filePath: string;
    selectedAttributes: string[];
    timeUnit: string;
    timeAttribute: string;
    includeTimeAttribute: boolean;
    categoricalAttributes: string[];
    derivatives: string[];
    numberOfStates: number;
    numberOfHistogramBuckets: number;
}

export interface DatasetAttribute {
    name: string;
    numeric: boolean;
}

export interface ModellingAttribute {
    name: string;
    source: 'input' | 'synthetic';
    sourceName?: string;
    label?: string;
    distWeight?: number;
    type: 'time' | 'numeric' | 'categorical' | 'text';
    subType: 'string' | 'float' | 'integer';
    timeType?: 'time' | 'float' | 'integer';
}

export interface ModellingOperation {
    op: 'timeShift' | 'timeDelta' | 'linTrend';
    inAttr: string;
    outAttr: string;
    windowUnit: 'samples' | 'numeric' | 'sec' | 'min' | 'hour' | 'day';
    timeAttr: string;
    windowSize: number;
}

export interface ModellingRequest {
    dataSource: {
        type: 'file' | 'internal';
        format: 'csv' | 'json';
        fieldSep: ',' | ';';
        fileName?: string;
        data?: string;
    };
    config: {
        numInitialStates: number;
        numHistogramBuckets: number;
        attributes: ModellingAttribute[];
        ops: ModellingOperation[];

        // eslint-disable-next-line camelcase
        decTree_maxDepth?: number;
        // eslint-disable-next-line camelcase
        decTree_minEntropyToSplit?: number;
        // eslint-disable-next-line camelcase
        decTree_minNormInfGainToSplit?: number;

        ignoreConversionErrors: boolean;
        distWeightOutliers: number;
        includeHistograms: boolean;
        includeDecisionTrees: boolean;
        includeStateHistory: boolean;
    };
}

export interface ModellingResponse {
    status: 'ok' | 'error';
    errors: string[];
    model: Record<string, unknown>;
}

export async function getModellingRequest(config: ModelConfig): Promise<ModellingRequest> {
    console.log('config', JSON.stringify(config, null, 2));

    const req: ModellingRequest = {
        dataSource: {
            type: 'file',
            format: 'csv',
            fieldSep: ',',
            fileName: config.filePath,
        },
        config: {
            numInitialStates: config.numberOfStates,
            numHistogramBuckets: config.numberOfHistogramBuckets,
            attributes: [],
            ops: [],

            // decTree_maxDepth: 3,
            // decTree_minEntropyToSplit: 0.1,
            // decTree_minNormInfGainToSplit: 0,

            ignoreConversionErrors: true,
            distWeightOutliers: 0.05,
            includeHistograms: true,
            includeDecisionTrees: true,
            includeStateHistory: true,
        },
    };

    // Generate attribute configurations.
    const datasetAttributes = await getDatasetAttributes(config.filePath);
    const attributes = datasetAttributes.map<ModellingAttribute>((attr, i) => {
        const isCategorical = config.categoricalAttributes.indexOf(`${i}`) > -1;
        return {
            name: attr.name,
            source: 'input',
            type: isCategorical ? 'categorical' : 'numeric',
            subType: isCategorical ? 'string' : 'float',
        };
    });
    const timeIndex = Number(config.timeAttribute);

    // Set time attribute.
    attributes[timeIndex] = {
        ...attributes[timeIndex],
        type: 'time',
        subType: 'integer',
        timeType: 'time',
    };

    // Filter selected attributes.
    req.config.attributes = [
        attributes[timeIndex],
        ...config.selectedAttributes
            .filter((key) => key !== `${timeIndex}`)
            .map((key) => attributes[Number(key)]),
    ];

    // Configure derivatives.
    req.config.ops = config.derivatives.map<ModellingOperation>((key) => ({
        op: 'timeDelta',
        inAttr: datasetAttributes[Number(key)].name,
        outAttr: `${datasetAttributes[Number(key)].name} derivative`,
        // windowUnit: config.timeUnit as ModellingOperation['windowUnit'],
        windowUnit: 'samples',
        timeAttr: attributes[timeIndex].name,
        windowSize: 1,
    }));
    console.log('req', JSON.stringify(req, null, 2));
    
    return req;
}

export async function getDatasetAttributes(filePath: string): Promise<DatasetAttribute[]> {
    const attributes: DatasetAttribute[] = [];

    try {
        const lines: string[][] = [];
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        const readFirstLines = (line: string) => {
            lines.push(...csvParse(line));

            if (lines.length > 1) {
                rl.off('line', readFirstLines).close();
            }
        };

        rl.on('line', readFirstLines);
        await once(rl, 'close');

        if (lines.length === 2 && lines[0].length === lines[1].length) {
            const [header, data] = lines;

            header.forEach((h, i) => {
                attributes.push({
                    name: h,
                    numeric: isNumeric(data[i]),
                });
            });
        }
    } catch {
        // Failed to read attributes.
    }

    return attributes;
}

class Modelling {
    options: AxiosRequestConfig;

    constructor(options: AxiosRequestConfig) {
        this.options = options;
    }

    async buildFromModelConfig(config: ModelConfig): Promise<ModellingResponse> {
        const req = await getModellingRequest(config);
        return this.build(req);
    }

    async build(req: ModellingRequest): Promise<ModellingResponse> {
        // const data = JSON.stringify(req);
        const options: AxiosRequestConfig<ModellingRequest> = {
            ...this.options,
            url: '/buildModel',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Length': `${data.length}`,
            },
            data: req,
        };
        const res = await axios.request<
            ModellingResponse,
            AxiosResponse<ModellingResponse>,
            ModellingRequest
        >(options);

        return res.data;
    }
}

export default Modelling;
