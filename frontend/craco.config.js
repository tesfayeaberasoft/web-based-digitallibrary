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
      // Add support for importing .mjs files
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      // Copy pdf.worker.min.mjs to both public (dev) and build (production)
      webpackConfig.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
              to: path.resolve(__dirname, 'public/pdf.worker.min.mjs'),
              force: true,
            },
            {
              from: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
              to: path.resolve(__dirname, 'build/pdf.worker.min.mjs'),
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
