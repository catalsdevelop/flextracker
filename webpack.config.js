var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')

var env = process.env.NODE_ENV
var base = {
  entry: {
    tracker: './src/index.js'
  },
  output: {
    path: './dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js'],
    fallback: [path.join(__dirname, '../node_modules')],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': '\''+ env + '\''
    }),
  ]
}

switch (env) {
  case 'production':
    module.exports = merge(base, {
      output: {
        filename: '[name].min.js'
      },
      devtool: '#source-map',
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false
          }
        }),
      ]
    })
    break
  case 'test':
    module.exports = merge(base, {
      devtool: '#inline-source-map',
      module: {
        preLoaders: [{
          test: /\.js$/,
          loader: 'isparta',
          include: path.resolve(__dirname, 'src')
        }]
      },
    })
    break
  case 'development' :
    module.exports = base
    break
}
