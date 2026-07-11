const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
