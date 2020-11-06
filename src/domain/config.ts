//@ts-ignore
const pkg = require('./package.json')

const LibConfig = Object.freeze({
    baseUrl: 'http://dev.datainsider.co',
    timeout: 45000,
    baseHeaders: {
        'Content-Type': 'application/json'
    },
    platform: 'web',
    version: pkg.version || '0.0.1',
    sessionMaxInactiveDuration: 30 * 60 * 1000
});

export default LibConfig
