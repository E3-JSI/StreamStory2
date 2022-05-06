export interface Config extends Record<string, unknown> {
    url: string;
    email: string;
    auth?: {
        local?: boolean;
        providers?: {
            id: string;
            name: string;
            authorizationUrl: string;
            clientId: string;
            scope?: string;
        }[];
    };
}

const config = (
    process.env.REACT_APP_CONFIG
        ? JSON.parse(process.env.REACT_APP_CONFIG)
        : {
              url: 'http://streamstory.ijs.si',
          }
) as Config;

export default config;
