const path = require('path');

module.exports = {
  entry: './src/content.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: false
              },
              target: 'es5'
            }
          }
        }
      }
    ]
  }
}