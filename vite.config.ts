import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: './tsconfig.node.json', rollupTypes: true }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets/fonts/*',
          dest: 'assets/fonts',
        },
        {
          src: 'vite.config.ts',
          dest: 'vite-config',
        },
        {
          src: 'tailwind.config.js',
          dest: 'tailwind-config',
        },
      ],
    }),
  ],
  build: {
    assetsDir: path.resolve(__dirname, 'src/assets'),
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/components/index.ts'),
        constants: path.resolve(__dirname, 'src/constants/index.ts'),
      },
      name: 'PaoloJulian-DesignSystem',
      fileName: (format) => `[name].${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'tailwindcss'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          tailwindcss: 'tailwindcss',
        },
      },
    },
    /**
     * Generate sourcemap for each build
     */
    sourcemap: true,
    /**
     * Remove the dist folder before building
     */
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
});
