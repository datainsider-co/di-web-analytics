module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],
    files: [
      'dist/index.js',
      'tests/base_test_function.js',
      {pattern: 'tests/**/*.spec.js', included: true},
    ],
    // exclude: [
    //   "tests/generate_data.spec.js"
    // ],
    reporters: ['progress'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: [ 'Chrome'],
    autoWatch: false,
    concurrency: Infinity,
    customLaunchers: {
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    },
  })
}
