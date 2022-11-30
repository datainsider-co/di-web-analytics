//@ts-ignore
const pkg = require('../../package.json');

const LibConfig = Object({
  timeout: 45000,
  baseHeaders: {
    'Content-Type': 'application/json'
  },
  platform: 'web',
  version: pkg.version || '0.0.1',
  sessionMaxInactiveDuration: 24 * 60 * 60 * 1000, // 24 hours
  apiKey: '',
  host: '',
  setValue: (key: string, value: any) => {
    return Object.assign(LibConfig, {[key]: value});
  }
});

export default LibConfig;
