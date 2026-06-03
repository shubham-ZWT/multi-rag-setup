import app from "./index";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "config", ".env") });
const PORT = process.env.PORT || 3000;

const server = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};

server();
