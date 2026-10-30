module.exports = {
  style: {
    postcss: {
      plugins: (plugins) => [require('tailwindcss'), ...plugins],
    },
  },
};
