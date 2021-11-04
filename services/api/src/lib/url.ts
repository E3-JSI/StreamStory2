/* eslint-disable import/prefer-default-export */
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
