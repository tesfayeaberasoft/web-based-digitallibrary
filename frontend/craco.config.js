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
      // ── 1. Handle .mjs files from node_modules correctly ──────────────────
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
      });

      // ── 2. Exclude pdfjs-dist worker from being bundled by webpack ─────────
      // Without this, webpack wraps the worker in its own module system which
      // breaks the internal message channel (sendWithPromise becomes null).
      webpackConfig.module.rules.push({
        test: /pdf\.worker(\.min)?\.m?js$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/js/[name][ext]',
        },
      });

      // ── 3. Copy worker to build output for production ──────────────────────
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
