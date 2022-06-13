module.exports = {
  outDir: './dist',
  esbuild: {
    minify: false,
    target: 'es2020',
    format: 'cjs',
  },
  assets: {
    baseDir: './lib',
  },
};
