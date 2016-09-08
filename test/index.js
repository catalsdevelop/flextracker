// http://webpack.github.io/docs/context.html#require-context
// https://github.com/webpack/karma-webpack

var testsContext = require.context('./unit', true, /Test\.js$/)
testsContext.keys().forEach(testsContext)

var srcContext = require.context('../src', true, /\.js$/)
srcContext.keys().forEach(srcContext)
