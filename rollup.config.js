import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import json from '@rollup/plugin-json';

export default [{
  input: 'src/index.js',
  output: {
    name: 'FrameAnimate',
    file: 'index.es.js',
    globals: {
      karas: 'karas',
    },
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'FrameAnimate',
    file: 'index.js',
    globals: {
      karas: 'karas',
    },
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'FrameAnimate',
    file: 'index.es.js',
    globals: {
      karas: 'karas',
    },
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'FrameAnimate',
    file: 'index.min.js',
    globals: {
      karas: 'karas',
    },
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
    uglify({
      sourcemap: true,
    }),
    json(),
  ],
}];
