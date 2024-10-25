import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "tailwindcss";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(
            __dirname,
            "src/assets/fonts/AvantGarde/AvantGarde.woff2",
          ),
          dest: "assets/fonts/AvantGarde",
        },
        {
          src: path.resolve(
            __dirname,
            "src/assets/fonts/AvantGarde/AvantGardeMedium.woff2",
          ),
          dest: "assets/fonts/AvantGarde",
        },
        {
          src: path.resolve(
            __dirname,
            "src/assets/fonts/ITC Avant Garde Gothic/ITC Avant Garde Gothic Medium.otf",
          ),
          dest: "assets/fonts/ITC Avant Garde Gothic",
        },
        {
          src: path.resolve(
            __dirname,
            "src/assets/fonts/ITC Avant Garde Gothic/ITC Avant Garde Gothic.otf",
          ),
          dest: "assets/fonts/ITC Avant Garde Gothic",
        },
        {
          src: path.resolve(
            __dirname,
            "src/assets/fonts/Merriweather/Merriweather-Bold.ttf",
          ),
          dest: "assets/fonts/Merriweather",
        },
        {
          src: path.resolve(
            __dirname,
            "src/assets/fonts/Merriweather/Merriweather-Regular.ttf",
          ),
          dest: "assets/fonts/Merriweather",
        },
        {
          src: path.resolve(__dirname, "src/fonts.css"),
          dest: ".",
        },
        {
          src: "vite.config.ts",
          dest: "vite-config",
        },
        {
          src: "tailwind.config.ts",
          dest: "tailwind-config",
        },
      ],
    }),
    react(),
    dts({ tsconfigPath: "./tsconfig.node.json", rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/components/index.ts"),
        constants: path.resolve(__dirname, "src/constants/index.ts"),
        icons: path.resolve(__dirname, "src/icons/index.ts"),
        utils: path.resolve(__dirname, "src/utils/index.ts"),
      },
      name: "PaoloJulian-DesignSystem",
      fileName: (format) => `[name].${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "tailwindcss"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          tailwindcss: "tailwindcss",
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
