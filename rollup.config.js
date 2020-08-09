import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

export default {
    input: 'src/index.ts',
    plugins: [typescript(), autoExternal()],
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        }
    ]
};
