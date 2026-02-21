import { defineConfig } from "vite";
import path from "path";

async function loadReactPlugin() {
  try {
    const mod = await import("@vitejs/plugin-react-swc");
    return mod.default();
  } catch {
    return null;
  }
}

async function loadComponentTagger() {
  try {
    const mod = await import("lovable-tagger");
    return mod.componentTagger();
  } catch {
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const reactPlugin = await loadReactPlugin();
  const taggerPlugin = mode === "development" ? await loadComponentTagger() : null;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [reactPlugin, taggerPlugin].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
