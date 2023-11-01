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
  input: `${paths.input.root}`,
  output: {
    file: `${paths.output.root}${fileName}`,
    format: 'iife',
    name: 'ilog'
  },
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





