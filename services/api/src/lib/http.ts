import fs from 'fs';
import http from 'http';

import { Request } from 'express';

/**
 * Get absolute URL from given port and path based on express request.
 * Default http port 80 is not included in the URL.
 * @param req Express request
 * @param port Port number
 * @param path Url path (with trailing slash)
 * @returns Absolute url including given port and path.
 */
export function getAbsoluteUrl(req: Request, port?: number, path?: string): string {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${port && port !== 80 ? `:${port}` : ''}${path ?? ''}`;
}

/**
 * Download file from given URL and store it to given file path.
 * @param url File URL (from where to download file)
 * @param filePath File path (where to store file)
 * @returns Success/error promise
 */
export async function downloadFile(url: string, filePath: string): Promise<boolean | Error> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            res.on('data', (chunk) => {
                fs.appendFileSync(filePath, chunk);
            });
            res.on('end', () => {
                resolve(true);
            });
        }).on('error', (err) => {
            reject(new Error(err.message));
        });
    });
}

/**
 * Send GET request to given URL.
 * @param url Request URL.
 * @returns Response or error.
 */
export async function get(url: string): Promise<any | Error> {
    return new Promise((resolve, reject) => {
        let result = '';
        http.get(url, (res) => {
            res.on('data', (chunk) => {
                result += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(result));
            });
        }).on('error', (err) => {
            reject(new Error(err.message));
        });
    });
}
