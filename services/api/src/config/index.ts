import { AxiosRequestConfig } from 'axios';
// import { Options as SmtpOptions } from 'nodemailer/lib/smtp-connection';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface Config extends Record<string, unknown> {
    url: string;
    // mailer: SmtpOptions;
    mailer: string | SMTPTransport | SMTPTransport.Options;
    auth?: {
        local?: boolean;
        providers?: {
            id: string;
            name: string;
            authorizationUrl: string;
            accessTokenUrl: string;
            clientId: string;
            clientSecret: string;
            scope?: string;
            userRequest?: AxiosRequestConfig;
            userResponse?: {
                email: string;
                name: string;
            };
        }[];
    };
}

const config = (
    process.env.CONFIG
        ? JSON.parse(process.env.CONFIG)
        : {
              url: 'http://streamstory.ijs.si',
              mailer: {},
          }
) as Config;

export default config;
