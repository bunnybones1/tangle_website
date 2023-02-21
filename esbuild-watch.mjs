import { build } from "esbuild";
import { glsl } from "esbuild-plugin-glsl";

build({
    entryPoints: ['index.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    format: 'esm',
    target: ['esnext'],
    tsconfig: './tsconfig.json',
    plugins: [
        glsl({
            minify: true
        })
    ],
    watch: true
})
.catch(() => process.exit(1));

