// vite.config.ts
import { defineConfig } from "file:///root/fhevm/node_modules/.pnpm/vite@5.4.20_@types+node@22.7.5_less@4.2.0_lightningcss@1.29.2_sass@1.71.1_terser@5.44.0/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///root/fhevm/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@3.1.2_svelte@4.2.20_vite@5.4.20_@types+node@22.7.5_less@4._68037252b507d5d8aec2fc80677c37f0/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { nodePolyfills } from "file:///root/fhevm/node_modules/.pnpm/vite-plugin-node-polyfills@0.24.0_rollup@4.52.0_vite@5.4.20_@types+node@22.7.5_less@4.2_43099f4f8400a878ab15b1463597fb35/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
  base: "/svelte-voting/",
  plugins: [
    svelte(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } })
  ],
  define: {
    global: "globalThis"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvcm9vdC9maGV2bS9leGFtcGxlcy9zdmVsdGUtdm90aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvcm9vdC9maGV2bS9leGFtcGxlcy9zdmVsdGUtdm90aW5nL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9yb290L2ZoZXZtL2V4YW1wbGVzL3N2ZWx0ZS12b3Rpbmcvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgc3ZlbHRlIH0gZnJvbSAnQHN2ZWx0ZWpzL3ZpdGUtcGx1Z2luLXN2ZWx0ZSdcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcvc3ZlbHRlLXZvdGluZy8nLFxuICBwbHVnaW5zOiBbXG4gICAgc3ZlbHRlKCksXG4gICAgbm9kZVBvbHlmaWxscyh7IGdsb2JhbHM6IHsgQnVmZmVyOiB0cnVlLCBnbG9iYWw6IHRydWUsIHByb2Nlc3M6IHRydWUgfSB9KSxcbiAgXSxcbiAgZGVmaW5lOiB7XG4gICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3UixTQUFTLG9CQUFvQjtBQUNyVCxTQUFTLGNBQWM7QUFDdkIsU0FBUyxxQkFBcUI7QUFHOUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsY0FBYyxFQUFFLFNBQVMsRUFBRSxRQUFRLE1BQU0sUUFBUSxNQUFNLFNBQVMsS0FBSyxFQUFFLENBQUM7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
