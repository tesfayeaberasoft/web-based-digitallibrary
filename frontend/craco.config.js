const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  style: {
    postcss: {
      plugins: (plugins) => [require('tailwindcss'), ...plugins],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Copy the pdfjs-dist 3.x classic worker to /public on every build.
      // BookReader.js points workerSrc directly at this static file.
      webpackConfig.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(
                __dirname,
                'node_modules/pdfjs-dist/build/pdf.worker.min.js'
              ),
              to: path.resolve(__dirname, 'public/pdf.worker.min.js'),
              force: true,
              noErrorOnMissing: true,
            },
          ],
        })
      );
      return webpackConfig;
    },
  },
};
