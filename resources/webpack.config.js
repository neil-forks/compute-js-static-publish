const path = require("path");
const webpack = require("webpack");
const { ProvidePlugin } = webpack;

let config;
try {
  config = require("./static-publish.rc.js");
} catch {
  console.error('Error loading static-publish.rc.js');
  process.exit(1);
}

let defaultContentTypes;
try {
  defaultContentTypes = require("./default-content-types.cjs");
} catch {
  console.error('Error loading default-content-types.cjs');
  process.exit(1);
}

const contentTypes = defaultContentTypes.mergeContentTypes(config.contentTypes ?? []);

const srcDir = path.resolve('./src');
const srcNodeModulesDir = path.resolve('./node_modules');
const publicDir = path.resolve(config.publicDir);

function testStaticFile(file) {
  if(!file.startsWith(publicDir + '/')) {
    return null;
  }
  if(file.startsWith(srcDir + '/')) {
    return null;
  }
  if(file.startsWith(srcNodeModulesDir + '/')) {
    return null;
  }
  for (const contentType of contentTypes) {
    let matched = false;
    if(contentType.test instanceof RegExp) {
      matched = contentType.test.test(file);
    } else {
      // should be a function
      matched = contentType.test(file);
    }
    if(matched) {
      return { binary: Boolean(contentType.binary) };
    }
  }
  return null;
}

if (publicDir.startsWith(path.resolve())) {
  // If public dir is INSIDE the compute-js app dir, results may be weird
  console.warn('⚠️ public files directory is inside of the Compute@Edge app directory.');
  console.warn('This is an unsupported scenario and you may experience trouble.');
  console.warn('');
}

module.exports = {
  entry: "./src/index.js",
  optimization: {
    minimize: false
  },
  target: "webworker",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "bin"),
    libraryTarget: "this",
  },
  module: {
    // Asset modules are modules that allow the use asset files (fonts, icons, etc)
    // without additional configuration or dependencies.
    rules: [
      // asset/source exports the source code of the asset.
      // Usage: e.g., import notFoundPage from "./page_404.html"
      {
        test: (file) => {
          const result = testStaticFile(file);
          return result != null && !result.binary;
        },
        type: "asset/source",
      },
      // asset/inline exports the raw bytes of the asset.
      // We base64 encode them here
      {
        test: (file) => {
          const result = testStaticFile(file);
          return result != null && result.binary;
        },
        type: "asset/inline",
        generator: {
          /**
           * @param {Buffer} content
           * @returns {string}
           */
          dataUrl: content => {
            return content.toString('base64');
          },
        }
      },
    ],
  },
  plugins: [
    // Polyfills go here.
    // Used for, e.g., any cross-platform WHATWG,
    // or core nodejs modules needed for your application.
    new ProvidePlugin({
      Buffer: [ "buffer", "Buffer" ],
    }),
  ],
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
    },
  },
};
