import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      // This allows us to resolve packages from node_modules
      moduleDirectories: ['node_modules'],
      // Allow resolving SVG files from node_modules
      extensions: ['.js', '.ts', '.tsx', '.svg', '.png'],
      // Make sure we can resolve the @swrpg-online/art package
      resolveOnly: [
        /^(?!@swrpg-online\/art)/  // Process all imports EXCEPT @swrpg-online/art
      ]
    }),
    url({
      include: ['**/*.svg', '**/*.png'],
      limit: 0, // Always generate files
      publicPath: '',
      destDir: 'dist/assets',
      fileName: '[name][extname]',
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    }),
  ],
  external: ['react', 'react-dom'], // Remove @swrpg-online/art from externals
}; 