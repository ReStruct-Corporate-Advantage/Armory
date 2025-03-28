var easyProxy = require('@blk/easy-dev-proxy');
var proxyConf = require('./proxy.base.conf');

module.exports = easyProxy.applyProxyAuth(proxyConf, 'DEV', {
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "cookieDomainRewrite": "",
}, {apiAuth: true});
