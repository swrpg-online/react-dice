import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: ['react', 'react-dom', '@swrpg-online/art'],
  plugins: [
    url({
      include: ['**/*.svg', '**/*.png'],
      limit: 0,
      emitFiles: true,
    }),
    resolve(),
    commonjs(),
    typescript(),
  ],
}; 