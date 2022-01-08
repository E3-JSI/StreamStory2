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
        http.get(url, (resp) => {
            resp.on('data', (chunk) => {
                fs.appendFileSync(filePath, chunk);
            });
            resp.on('end', () => {
                resolve(true);
            });
        }).on('error', (err) => {
            reject(new Error(err.message));
        });
    });
}
