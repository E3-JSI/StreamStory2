const { createProxyMiddleware } = require('http-proxy-middleware');
console.log(process.env);
module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: process.env.REACT_APP_PROXY,
            changeOrigin: true,
        }),
    );
};
