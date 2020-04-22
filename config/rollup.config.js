import { resolve } from 'path';
import sourceMaps from 'rollup-plugin-sourcemaps';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';

import pkg from '../package.json';

/**
 * @typedef {import('./types').RollupConfig} Config
 */
/**
 * @typedef {import('./types').RollupPlugin} Plugin
 */

const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

/**
 * External modules to avoid bundling.
 *
 * @type {string[]}
 */
const external = Object.keys(pkg.peerDependencies) || [];

/**
 *  @type {Plugin[]}
 */
const plugins = /** @type {Plugin[]} */ ([
  json(),
  commonjs(),
  // Allow node_modules resolution.  Use 'external' to control
  // which external modules to include in the bundle
  // https://github.com/rollup/rollup-plugin-node-resolve#usage
  nodeResolve(),
  sourceMaps(),
  babel({
    presets: [
      [
        '@babel/preset-env',
        {
          // Transformation of ES6 module syntax to another module type
          modules: false,
          // How to handle polyfills, 'usage' analyses each file and places the
          // required imports on each one, rollup ensures single imports
          useBuiltIns: 'usage',
          corejs: 2,
          targets: {
            // To check what's covered: https://browserl.ist
            browsers: [
              '>10%',
              'ie>=11',
              'not ie<11',
              'not ios_saf<10',
              'not android<6',
            ],
          },
        },
      ],
    ],
    // To avoiding circular dependencies with useBuiltIns: 'usage' these two
    // settings are needed, which avoids core-js importing itself
    sourceType: 'unambiguous',
    ignore: [/[\/\\]core-js/],
  }),
]);

/**
 * @type {Config}
 */
const umdConfig = {
  inlineDynamicImports: true,
  external,
  // Start with esm5 (es5 with import/export)
  input: resolve(dist, 'esm5', 'index.js'),
  output: {
    file: pkg.main,
    format: 'umd',
    name: pkg.config.umdName,
    sourcemap: true,
  },
  plugins,
};

export default [umdConfig];
