// Entry point - loads env and starts the server
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log(process.env.MONGO_URI)
    await connectDB(process.env.MONGO_URI);
    const server = app.listen(PORT, () => {
      console.log(
        `DocAI backend running on port ${PORT} — env: ${
          process.env.NODE_ENV || "development"
        }`
      );
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
})();
