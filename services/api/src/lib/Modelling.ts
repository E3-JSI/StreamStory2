import fs from 'fs';
import { once } from 'events';
import readline from 'readline';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import csvParse from 'csv-parse/lib/sync';

import { isNumeric } from '../utils/misc';

export interface ModelConfig {
    filePath: string;
    selectedAttributes: string[];
    timeAttribute: string;
    includeTimeAttribute: boolean;
    categoricalAttributes: string[];
    numberOfStates: number;
    numberOfHistogramBuckets: number;
}

export interface DatasetAttribute {
    name: string;
    numeric: boolean;
}

export interface ModellingAttribute {
    name: string;
    sourceName?: string;
    label?: string;
    type: 'time' | 'numeric' | 'categorical' | 'text';
    subType: 'string' | 'float' | 'integer';
    timeType?: 'time' | 'float' | 'integer';
}

export interface ModellingOperation {
    op: string;
}

export interface ModellingRequest {
    dataSource: {
        type: 'file' | 'internal';
        format: 'csv' | 'json';
        fieldSep: ',' | ';';
        fileName: string;
    };
    config: {
        numInitialStates: number;
        numHistogramBuckets: number;
        attributes: ModellingAttribute[];
        ops: ModellingOperation[];
    };
}

export interface ModellingResponse {
    status: 'ok' | 'error';
    errors: string[];
    model: Record<string, unknown>;
}

export async function getModellingRequest(config: ModelConfig): Promise<ModellingRequest> {
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
        },
    };
    const datasetAttributes = await getDatasetAttributes(config.filePath);
    const attributes = datasetAttributes.map(
        (attr) =>
            ({
                name: attr.name,
                type: 'numeric',
                subType: 'float',
            } as ModellingAttribute)
    );
    const timeIndex = Number(config.timeAttribute);

    // Set time attribute.
    attributes[timeIndex] = {
        ...attributes[timeIndex],
        type: 'time',
        subType: 'integer',
        timeType: 'time',
    };

    // Filter attributes.
    req.config.attributes = [
        attributes[timeIndex],
        ...config.selectedAttributes.map((key) => attributes[Number(key)]),
    ];

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
