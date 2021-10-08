//@ts-ignore
const pkg = require('../../package.json')

const LibConfig = Object.freeze({
  baseUrl: 'https://hello.datainsider.co/',
  timeout: 45000,
  baseHeaders: {
    'Content-Type': 'application/json'
  },
  platform: 'web',
  version: pkg.version || '0.0.1',
  sessionMaxInactiveDuration: 3 * 60 * 60 * 1000 // 3 hours
});

export default LibConfig
