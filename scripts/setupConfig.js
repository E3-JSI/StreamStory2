const fs = require('fs');

var serviceName = process.argv[2];
var fileName = process.argv[3];
var config = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
var newConfig = {};

switch (serviceName) {
    case 'client': {
        newConfig['url'] = config.url;

        // Include auth config.
        if (config.auth) {
            newConfig['auth'] = {};

            if (config.auth.local !== undefined) {
                newConfig.auth['local'] = config.auth.local;
            }

            if (config.auth.providers) {
                newConfig.auth['providers'] = [];

                // Add providers.
                for (var i = 0; i < config.auth.providers.length; i++) {
                    var provider = config.auth.providers[i];
                    var newProvider = {};
                    ['id', 'name', 'authorizationUrl', 'redirectUri', 'clientId', 'scope'].forEach(
                        function (key) {
                            newProvider[key] = provider[key];
                        },
                    );
                    newConfig.auth.providers.push(newProvider);
                }
            }
        }

        break;
    }

    default:
        newConfig = config;
        break;
}

console.log(JSON.stringify(newConfig));
