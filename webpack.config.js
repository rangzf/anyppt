const path = require('path')
const fs = require('fs')

const distPath = path.resolve(__dirname, 'dist')

module.exports = {
  entry: './src/index.js',
  output: {
    path: distPath,
    filename: 'anyppt.js',
    libraryTarget: 'umd',
    library: "anyppt"
  },
  mode: process.env.NODE_ENV || 'production',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    {
      apply: function(compiler) {
        compiler.plugin('done', function(compilation, callback) {
          fs.writeFileSync(path.resolve('extension/anyppt/anyppt.js'), fs.readFileSync(path.resolve(distPath, 'anyppt.js')))
        })
      }
    }
  ]
}
