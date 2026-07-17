
import dotenv from "dotenv";

// Root bootstrap so `node index.js` from workspace starts the backend app.
dotenv.config({ path: "./server/.env" });

import("./server/index.js").catch((error) => {
  console.error("Failed to start server from root bootstrap:", error);
  process.exit(1);
});
