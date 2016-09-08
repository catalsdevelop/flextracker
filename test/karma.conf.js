var path = require('path')
var webpackConfig = require('../webpack.config')

delete webpackConfig.entry

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'should', 'sinon'],
    reporters: ['spec', 'coverage'],
    files:['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware : {
      noInfo: true
    },
    coverageReporter: {
      dir: './coverage',
      reporters:[
        {type: 'lcov', subdir: '.'},
        {type: 'text-summary'}
      ]
    }
  })
}
