import commonjs from '@rollup/plugin-commonjs'
import {nodeResolve} from '@rollup/plugin-node-resolve' 
import strip from '@rollup/plugin-strip'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'
import sass from 'rollup-plugin-sass'; 
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import replace from '@rollup/plugin-replace'
import preserveDirectives from 'rollup-preserve-directives'
import pkg from './package.json' with {type: 'json'}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const commonPlugins = [
    commonjs(),
    nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectories: ['node_modules', 'src'],
        preferBuiltins: false
    }),
    json(),
    replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        __buildDate__: () => JSON.stringify(new Date()),
        __buildVersion: 15,
        '__PACKAGE_NAME__': pkg.name
    }),
    typescript({
        tsconfig: 'tsconfig.json',
        sourceMap: true,
    }),
    preserveDirectives(),
    strip({
        include: ['**/*.(js|mjs|ts|tsx)'],
        debugger: true,
        functions: ['console.log', 'console.debug'],
        sourceMap: true
    }),
    sass({
        output: 'lib/assets/index.css',
    })
]
const commonExternal = [
    ...(pkg.dependencies ? Object.keys(pkg.dependencies) : []),
    ...(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []),
    ...(pkg.devDependencies ? Object.keys(pkg.devDependencies) : [])
]

let commonConfig = [{
    strictDeprecations: true,
    input: 'src/index.common.tsx',
    output: {
        file: 'lib/index.common.mjs',
        format: 'esm',
        sourcemap: true,
        assetFileNames: '[name][extname]'
    },
    external: commonExternal,
    plugins: [del({targets: 'lib/*'}), ...commonPlugins]
},
    {
        input: 'src/index.common.tsx',
        output: {
            file: 'lib/index.common.cjs',
            format: 'cjs',
            sourcemap: true,
            assetFileNames: '[name][extname]'
        },
        external: commonExternal,
        plugins: commonPlugins
    },
    {
        input: 'lib/dts/index.common.d.ts',
        output: [{file: 'lib/index.common.d.ts'}],
        external: [/\.(css|scss)$/],
        plugins: [
            dts()
        ]
    }
]

const serverConfig = [{
    input: 'src/index.server.tsx',
    output: {
        file: 'lib/index.server.mjs',
        format: 'esm',
        sourcemap: true,
        assetFileNames: '[name][extname]'
    },
    external: commonExternal,
    plugins: commonPlugins
}, {
    input: 'src/index.server.tsx',
    output: {
        file: 'lib/index.server.cjs',
        format: 'cjs',
        sourcemap: true,
        assetFileNames: '[name][extname]'
    },
    external: commonExternal,
    plugins: commonPlugins
},
    {
        input: 'lib/dts/index.server.d.ts',
        output: [{file: 'lib/index.server.d.ts'}],
        external: [/\.(css|scss)$/],
        plugins: [
            dts()
        ]
    }
]

const clientConfig = [{
    input: 'src/index.client.tsx',
    output: {
        file: 'lib/index.client.mjs',
        format: 'esm',
        sourcemap: true,
        assetFileNames: '[name][extname]'
    },
    external: commonExternal,
    plugins: commonPlugins
}, {
    input: 'src/index.client.tsx',
    output: {
        file: 'lib/index.client.cjs',
        format: 'cjs',
        sourcemap: true,
        assetFileNames: '[name][extname]'
    },
    external: commonExternal,
    plugins: commonPlugins
},
    {
        input: 'lib/dts/index.client.d.ts',
        output: [{file: 'lib/index.client.d.ts'}],
        external: [/\.(css|scss)$/],
        plugins: [
            dts()
        ]
    }
]

const exportConfig = commonConfig.concat(serverConfig).concat(clientConfig)

export default exportConfig