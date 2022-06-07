module.exports = {
  outDir: './dist',
  esbuild: {
    minify: false,
    target: 'es2020',
  },
  assets: {
    baseDir: './lib',
    filePatterns: ['**/*.ts'],
  },
};
