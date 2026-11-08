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
      // Allow .mjs files from node_modules to be processed correctly
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
      });

      // Keep the pdf worker in /public so we can serve it as a static file.
      // We use a blob: URL in BookReader.js to bypass webpack's Worker factory.
      webpackConfig.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(
                __dirname,
                'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
              ),
              to: path.resolve(__dirname, 'public/pdf.worker.min.mjs'),
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
