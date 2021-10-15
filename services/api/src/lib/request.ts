// import https, { RequestOptions } from 'https';
import http, { RequestOptions } from 'http';
import { URL } from 'url';

/**
 * Do a request with options provided.
 * @param options Request options.
 * @param data Request data.
 * @return A promise of request.
 */
function request<T>(options: string | RequestOptions | URL, data: unknown): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(responseBody));
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(data);
        req.end();
    });
}

export default request;
