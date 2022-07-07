export interface Config extends Record<string, unknown> {
    config: string;
    url: string;
    email: string;
    languages?: string[];
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
              config: 'default',
              url: 'http://streamstory.ijs.si',
              email: 'streamstory@ijs.si'
          }
) as Config;

export default config;
