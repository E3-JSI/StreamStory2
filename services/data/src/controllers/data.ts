import fs from 'fs';
import path from 'path';
import { once } from 'events';
import readline from 'readline';

import { NextFunction, Request, Response } from 'express';
import { Parser } from 'json2csv';
import csvParse from 'csv-parse/lib/sync';

import { isNumeric } from '../utils/misc';

interface DataPoint {
    [attribute: string]: number | string | null;
}

function getDataFilePath(): string {
    return path.resolve('files', 'data.csv');
}

export async function readSeries(filePath: string, from?: Date, to?: Date): Promise<DataPoint[]> {
    const data: DataPoint[] = [];

    try {
        const lines: string[][] = [];
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        const readFirstLines = (line: string) => {
            const parsedLine = csvParse(line)[0];
            const date = new Date(Math.abs(parseInt(parsedLine[0], 10)));

            if (!((from && date < from) || (to && date > to))) {
                lines.push(parsedLine);
            }
        };

        rl.on('line', readFirstLines);
        await once(rl, 'close');

        const [header, ...rows] = lines;

        rows.forEach((row) => {
            const dataPoint: DataPoint = {};
            header.forEach((h, i) => {
                dataPoint[h] = isNumeric(row[i]) ? parseFloat(row[i]) : row[i];
            });
            data.push(dataPoint);
        });
    } catch {
        // Failed to read attributes.
    }

    return data;
}

export async function readLastDataPoint(filePath: string): Promise<DataPoint | null> {
    let dataPoint: DataPoint | null = null;

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
            const [header, row] = lines;
            header.forEach((h, i) => {
                if (dataPoint === null) {
                    dataPoint = {};
                }

                dataPoint[h] = isNumeric(row[i]) ? parseFloat(row[i]) : row[i];
            });
        }
    } catch {
        // Failed to read attributes.
    }

    return dataPoint;
}

export async function getSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const filePath = getDataFilePath();
        const series = await readSeries(
            filePath,
            req.query.from ? new Date(`${req.query.from}`) : undefined,
            req.query.to ? new Date(`${req.query.to}`) : undefined
        );

        if (req.query.format === 'csv') {
            const json2csv = new Parser({ fields: series.length ? Object.keys(series[0]) : [] });
            const csv = json2csv.parse(series);
            res.header('Content-Type', 'text/csv');
            res.attachment('data.csv');
            res.status(200).send(csv);
            return;
        }

        res.status(200).json({
            series,
        });
    } catch (error) {
        next(error);
    }
}

export async function getLastDataPoint(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const filePath = getDataFilePath();
        const lastDataPoint = await readLastDataPoint(filePath);
        res.status(200).json({
            series: [lastDataPoint],
        });
    } catch (error) {
        next(error);
    }
}
