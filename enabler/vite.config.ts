import { resolve } from "path";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin({
      injectCodeFunction: function injectCodeCustomRunTimeFunction(
        cssCode: string,
        options
      ) {
        try {
          if (typeof document != "undefined") {
            var elementStyle = document.createElement("style");
            // checkout will look for this attribute to remove the style tag
            // when the checkout is closed for cleanup purposes
            elementStyle.setAttribute("data-ctc-connector-styles", "");
            for (const attribute in options.attributes) {
              elementStyle.setAttribute(
                attribute,
                options.attributes[attribute]
              );
            }
            elementStyle.appendChild(document.createTextNode(cssCode));
            document.head.appendChild(elementStyle);
          }
        } catch (e) {
          console.error("vite-plugin-css-injected-by-js", e);
        }
      },
    }),
  ],
  build: {
    outDir: resolve(__dirname, "public"),
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/main.ts"),
      name: "Connector",
      formats: ["es", "umd"],
      // the proper extensions will be added
      fileName: (format) => `connector-enabler.${format}.js`,
    },
  },
});
