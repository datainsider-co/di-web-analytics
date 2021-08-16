import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'public',
    format: 'iife',
    name: 'DiTracking'
  },
  plugins: [
    json(),
    commonjs({ 
      transformMixedEsModules: true
    }),
    nodePolyfills(),
    nodeResolve({
      browser: true,
    }),
    
    typescript({ tsconfig: './tsconfig.dev.json' }), 
  ]
}
