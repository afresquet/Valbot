const dotenv = require("dotenv");

dotenv.config();

const isProduction = process.env.ENV === "production";

module.exports = isProduction;
