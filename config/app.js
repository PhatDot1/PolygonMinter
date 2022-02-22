let config;

import dev from "./development.js";
import prod from "./production.js";

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv === "development") {
    config = dev;
} else {
    config = prod;
}

export default config;