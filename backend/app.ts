import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./auth/auth.route";
import profileRouter from "./profile/profile.route";
import cookieParser from "cookie-parser";
import workflowRouter from "./workflows/workflow.route";
import credentialsRouter from "./credentials/credentials.route";
import billingRouter from "./billing/billing.route";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); // in order to get body from the request
app.use(morgan("dev")); // in order to log
app.use(cookieParser()); // in order to read cookie for refresh token

app.get("/", (req, res) => {
  res.status(200).send("Kairo Backend running");
});

// OK
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "HEALTH OK" });
});

// OK
app.use("/api/auth", authRouter);

// OK
app.use("/api", profileRouter);


// OK
app.use("/api/workflows", workflowRouter);

// OK
app.use("/api/credentials", credentialsRouter);

// OK
app.use("/api/billing", billingRouter);

export default app;
