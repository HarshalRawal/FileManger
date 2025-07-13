import app from "./app.js";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./db/index.js";
import { connectRedis,disconnectRedis } from "./db/redis.js";
dotenv.config();

const PORT = process.env.PORT ;

app.listen(PORT, async () => {
  await connectDB();
  await connectRedis();
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await disconnectDB();
  await disconnectRedis();
  console.log("Server closed");
  process.exit(0);
});
