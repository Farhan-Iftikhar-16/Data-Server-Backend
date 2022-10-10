const logger = require("./logger");
const dotenv = require("dotenv");
const fs = require("fs");

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    logger.debug("Using .env.example file to supply config environment variables");
    dotenv.config({ path: ".env.example" });  // you can delete this after you create your own .env file!
}
const ENVIRONMENT = process.env.NODE_ENV;
exports.ENVIRONMENT = ENVIRONMENT;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'
console.log("env",prod);
exports.SESSION_SECRET = process.env["SESSION_SECRET"];

