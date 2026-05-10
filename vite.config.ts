import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import path from "path";
import { cpSync, mkdirSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";

const staticAssetTargets = [
  {
    src: path.resolve(__dirname, "src/assets/fonts/AvantGarde"),
    dest: path.resolve(__dirname, "dist/assets/fonts/AvantGarde"),
  },
  {
    src: path.resolve(__dirname, "src/assets/fonts/ITC Avant Garde Gothic"),
    dest: path.resolve(__dirname, "dist/assets/fonts/ITC Avant Garde Gothic"),
  },
  {
    src: path.resolve(__dirname, "src/assets/fonts/Merriweather"),
    dest: path.resolve(__dirname, "dist/assets/fonts/Merriweather"),
  },
  {
    src: path.resolve(__dirname, "src/fonts.css"),
    dest: path.resolve(__dirname, "dist/fonts.css"),
  },
  {
    src: path.resolve(__dirname, "src/theme.css"),
    dest: path.resolve(__dirname, "dist/theme.css"),
  },
  {
    src: path.resolve(__dirname, "vite.config.ts"),
    dest: path.resolve(__dirname, "dist/vite-config/vite.config.ts"),
  },
] as const;

function copyStaticAssets() {
  return {
    name: "p-copy-static-assets",
    apply: "build" as const,
    closeBundle() {
      for (const target of staticAssetTargets) {
        mkdirSync(path.dirname(target.dest), { recursive: true });
        cpSync(target.src, target.dest, { recursive: true, force: true });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    copyStaticAssets(),
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
      external: ["react", "react/jsx-runtime", "react-dom", "tailwindcss"],
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
});
