import app from "./index";
import dotenv from "dotenv";
import path from "node:path";
import cron from "node-cron";
import AnalyticsService from "./services/analytics.service";
import { allEnvsExist } from "./constants/env";

dotenv.config({ path: path.resolve(process.cwd(), "config", ".env") });
const PORT = process.env.PORT || 3000;

const server = () => {
  app.listen(PORT, () => {
    if (!allEnvsExist()) {
      console.error("One or more required environment variables are missing.");
      process.exit(1);
    }
    console.log("Environment variables loaded successfully.");
    console.log(`Server is running on port http://localhost:${PORT}`);
  });

  AnalyticsService.aggregateDaily();

  cron.schedule("0 */12 * * *", () => {
    console.log("[Cron] Running daily analytics aggregation...");
    AnalyticsService.aggregateDaily();
  });
};

server();
