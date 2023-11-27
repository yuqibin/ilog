import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'

const paths = {
  input: {
    root: 'src/index.ts'
  },
  output: {
    root: 'dist/'
  }
}

const fileName = `ilog.js`

export default {
  input: `src/index.ts`,
  output: [
    {
      file: 'dist/es/ilog.js',
      format: 'esm', // 将软件包保存为 ES 模块文件
      name: ''
      // exports: 'default'
    },
    {
      file: 'dist/ilog.js',
      format: 'cjs', // CommonJS，适用于 Node 和 Browserify/Webpack
      name: ''
    },
    {
      file: `dist/iife/ilog.js`,
      format: 'iife',
      name: 'doogilog'
    }
  ],
  plugins: [
    json(),
    resolve({
      extensions: ['.ts', '.js', '.tsx']
    }),
    typescript({
      tsconfig: 'tsconfig.json'
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    uglify()
  ]
}









