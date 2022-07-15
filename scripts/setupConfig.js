const fs = require('fs');
const path = require('path');

let serviceName = process.argv[2];
let fileName = process.argv[3];
let config = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
let newConfig = {
    config: path.parse(fileName).name,
};

if (serviceName === 'client') {
    newConfig['url'] = config.url;
    newConfig['email'] = config.email;
    newConfig['languages'] = config.languages || ['en'];

    // Include auth config.
    if (config.auth) {
        newConfig['auth'] = {};

        if (config.auth.local !== undefined) {
            newConfig.auth['local'] = config.auth.local;
        }

        if (config.auth.providers) {
            newConfig.auth['providers'] = [];

            // Add providers.
            for (let i = 0; i < config.auth.providers.length; i++) {
                let provider = config.auth.providers[i];
                let newProvider = {};
                ['id', 'name', 'authorizationUrl', 'redirectUri', 'clientId', 'scope'].forEach(
                    function (key) {
                        newProvider[key] = provider[key];
                    },
                );
                newConfig.auth.providers.push(newProvider);
            }
        }
    }

    for (let i = 0; i < newConfig.languages.length; i++) {
        const language = newConfig.languages[i];
        const src = `configs/${newConfig.config}/i18n/${language}/translation.json`;
        const dest = `src/config/i18n/${language}`;
        if (fs.existsSync(src)) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }

            fs.copyFileSync(src, `${dest}/translation.json`);
        }
    }
} else {
    newConfig = { ...newConfig, ...config };
}

console.log(JSON.stringify(newConfig));
