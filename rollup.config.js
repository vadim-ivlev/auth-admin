import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import {terser} from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

module.exports = {
    input: 'src/js/index.js',
    
    treeshake: false,
    
    output: {
      file: 'public/js/bundle.js',
      sourcemap: true,
      format: 'cjs'
    },
    watch: {
        include: 'src/**'
    },
    plugins: [
        resolve()
        ,commonjs()
        ,!production && livereload('public')
        ,production && terser()
    ]
};