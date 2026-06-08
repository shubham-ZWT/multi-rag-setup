import app from "./index";
import dotenv from "dotenv";
import path from "node:path";
import cron from "node-cron";
import AnalyticsService from "./services/analytics.service";

dotenv.config({ path: path.resolve(process.cwd(), "config", ".env") });
const PORT = process.env.PORT || 3000;

const server = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });

  AnalyticsService.aggregateDaily();

  cron.schedule("0 */12 * * *", () => {
    console.log("[Cron] Running daily analytics aggregation...");
    AnalyticsService.aggregateDaily();
  });
};

server();
