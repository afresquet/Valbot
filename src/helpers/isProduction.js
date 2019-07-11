import dotenv from "dotenv";

dotenv.config();

export default process.env.ENV === "production";
