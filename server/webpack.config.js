const path = require('path');

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, './'),
    publicPath: '',
    filename: 'app.js',
    library: {
      type: 'commonjs'
    }
  },
  externals: {
    archiver: 'archiver',
    chalk: 'chalk',
    chokidar: 'chokidar',
    compression: 'compression',
    'connect-multiparty': 'connect-multiparty',
    cors: 'cors',
    express: 'express',
    log4js: 'log4js',
    rimraf: 'rimraf',
    'socket.io': 'socket.io',
    uuid: 'uuid',
    'zip-local': 'zip-local'
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_modules')
      }
    ]
  }
}
