import type { BuildOptions } from 'esbuild';

const config: BuildOptions = {
  entryPoints: ['./src/extension.ts'],
  minify: true,
  bundle: true,
  platform: 'node',
  metafile: false,
  target: 'node12',
  outdir: './dist',
  outbase: './src',
  outExtension: {
    '.js': '.cjs',
  },
  format: 'cjs',
  external: ['vscode'],
  loader: {
    '.ts': 'ts',
    '.js': 'js',
  },
  logLevel: 'info',
};

export default config;
