const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const meRouter = require("./routes/me");
const profileRouter = require("./routes/profile");
const domainsRouter = require("./routes/domains");
const applicationsRouter = require("./routes/applications");
const tasksRouter = require("./routes/tasks");
const { uploadsDir } = require("./uploads");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true, // required so the browser will send/accept the session cookie
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/profile", profileRouter);
app.use("/api/domains", domainsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/uploads", express.static(uploadsDir));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : "Internal server error" });
});

module.exports = app;
