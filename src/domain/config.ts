//@ts-ignore
const pkg = require('../../package.json');

const LibConfig = Object.freeze({
  timeout: 45000,
  baseHeaders: {
    'Content-Type': 'application/json'
  },
  platform: 'web',
  version: pkg.version || '0.0.1',
  sessionMaxInactiveDuration: 3 * 60 * 60 * 1000, // 3 hours
  trackingApiKey: '',
  host: '',
  setValue: (key: string, value: any) => {
    return Object.assign(LibConfig, {key: value});
  }
});

export default LibConfig;
