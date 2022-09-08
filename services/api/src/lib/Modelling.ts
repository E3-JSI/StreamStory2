import fs from 'fs';
import path from 'path';
import { once } from 'events';
import readline from 'readline';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import csvParse from 'csv-parse/lib/sync';

import { isNumeric } from '../utils/misc';

export interface DataPoint {
    [attribute: string]: number | string | null;
}
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

export interface DataSource {
    type: 'file' | 'internal';
    format: 'csv' | 'json';
    fieldSep?: ',' | ';';
    fileName?: string;
    data?: string | DataPoint[];
}

export interface ModellingRequest {
    dataSource: DataSource;
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

export interface TrainedModel {
    // TODO: Model data structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [property: string]: any;
}

export interface ModellingResponse {
    status: 'ok' | 'error';
    errors: string[];
    model: TrainedModel;
}

export interface ModelState {
    state: number;
    data: DataPoint;
}

export interface ClassificationRequest {
    dataSource: DataSource;
    model: TrainedModel;
}

export interface ClassificationResponse {
    status: 'ok' | 'error';
    errors: string[];
    classifications?: number[];
}

export function isDataValid(data: DataPoint, model: TrainedModel): boolean {
    if (!model.dataset || !model.dataset.cols) {
        return false;
    }

    const datasetCols = model.dataset.cols.map((col: any) => col.name);
    const dataCols = Object.keys(data);

    for (let i = 0; i < datasetCols.length; i++) {
        const datasetCol = datasetCols[i];
        if (!dataCols.includes(datasetCol)) {
            return false;
        }
    }

    return true;
}

export function getEnterTriggerStates(newState: number, previousState: number, model: TrainedModel): any[] {
    const states: any[] = [];
    for (let i = 0; i < model?.scales?.length; i++) {
        const scale = model.scales[i];
        for (let j = 0; j < scale?.states?.length; j++) {
            const state = scale.states[j];
            const eventId = state?.ui?.eventId;
            if (eventId &&
                state?.initialStates.includes(newState) &&
                !state?.initialStates.includes(previousState)
            ) {
                states.push({
                    initialState: newState,
                    scale: state.scaleIx,
                    label: state?.suggestedLabel?.label || state?.ui?.label,
                    eventId
                });
            }
        }
    }

    return states;
}

export function getExitTriggerStates(newState: number, previousState: number, model: TrainedModel): any[] {
    const states: any[] = [];
    for (let i = 0; i < model?.scales?.length; i++) {
        const scale = model.scales[i];
        for (let j = 0; j < scale?.states?.length; j++) {
            const state = scale.states[j];
            const eventId = state?.ui?.eventId;
            if (eventId &&
                !state?.initialStates.includes(newState) &&
                state?.initialStates.includes(previousState)
            ) {
                states.push({
                    initialState: newState,
                    scale: state.scaleIx,
                    label: state?.suggestedLabel?.label || state?.ui?.label,
                    eventId
                });
            }
        }
    }

    return states;
}

export async function getDatasetAttributes(filePath: string): Promise<DatasetAttribute[]> {
    const attributes: DatasetAttribute[] = [];

    try {
        if (path.extname(filePath).toLowerCase() === '.csv') {
            // CSV
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
                        numeric: !data[i].trim() || isNumeric(data[i]),
                    });
                });
            }
        } else {
            // JSON
            const series = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const data = series[0];
            Object.keys(data).forEach((key) => {
                attributes.push({
                    name: key,
                    numeric: !data[key].trim() || isNumeric(`${data[key]}`),
                });
            });
        }
    } catch {
        // Failed to read attributes.
    }

    return attributes;
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

    return req;
}

export function getClassificationRequest(
    data: DataPoint,
    model: TrainedModel
): ClassificationRequest {
    const req: ClassificationRequest = {
        dataSource: {
            type: 'internal',
            format: 'csv',
            fieldSep: ',',
            data: `${Object.keys(data).join(',')}\n${Object.values(data).join(',')}`,
        },
        model,
    };

    return req;
}

class Modelling {
    options: AxiosRequestConfig;

    constructor(options: AxiosRequestConfig) {
        this.options = options;
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

    async buildFromModelConfig(config: ModelConfig): Promise<ModellingResponse> {
        const req = await getModellingRequest(config);
        return this.build(req);
    }

    async classify(req: ClassificationRequest): Promise<ClassificationResponse> {
        const options: AxiosRequestConfig<ClassificationRequest> = {
            ...this.options,
            url: '/classifySamples',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Length': `${data.length}`,
            },
            data: req,
        };
        const res = await axios.request<
            ClassificationResponse,
            AxiosResponse<ClassificationResponse>,
            ClassificationRequest
        >(options);

        return res.data;
    }

    async classifyDataPoint(data: DataPoint, model: TrainedModel): Promise<ClassificationResponse> {
        const req = getClassificationRequest(data, model);
        return this.classify(req);
    }
}

export default Modelling;
