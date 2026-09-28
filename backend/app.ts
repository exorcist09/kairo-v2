import express from "express";
import morgan from "morgan";
import authRouter from "./auth/auth.route";
import profileRouter from "./profile/profile.route";
import cookieParser from "cookie-parser";
import workflowRouter from "./workflows/workflow.route";
import credentialsRouter from "./credentials/credentials.route";
import billingRouter from "./billing/billing.route";

const app = express();

app.use(express.json()); // in order to get body from the request
app.use(morgan("dev")); // in order to log
app.use(cookieParser()); // in order to read cookie for refresh token

app.get("/", (req, res) => {
  res.status(200).send("Kairo Backend");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "HEALTH OK" });
});

app.use("/api/auth", authRouter);

app.use("/api", profileRouter);

app.use("/api/workflows", workflowRouter);

app.use("/api/credentials", credentialsRouter);

app.use("/api/billing", billingRouter);

export default app;
