import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const userIdPrimary = process.env.USER_ID_PRIMARY!;
export const userIdSecondary = process.env.USER_ID_SECONDARY!;

export const apiKey = process.env.API_KEY_PRIMARY!;
export const apiUrl = process.env.API_URL!;
export const coreApiToken = process.env.CORE_API_TOKEN!;
