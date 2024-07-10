import * as path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
  entry: './src/index.ts', // Your TypeScript entry file
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'module', // Use ES modules
		clean: true
  },
  experiments: {
    outputModule: true // Enable output as ES module
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader' // Use ts-loader for TypeScript files
      }
    ]
  },
  externals: {
    buffer: 'commonjs buffer' // Exclude 'buffer' from the bundle
  },
  target: ['web', 'es2020'], // Ensure the bundle is compatible with both browser and Node.js
  node: {
    __dirname: false,
    __filename: false
  }
};

export default config;