import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.route";
import profileRouter from "./routes/profile.route";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json()); // in order to get body from the request
app.use(morgan("dev")); // in order to log
app.use(cookieParser()); // in order to read cookie for refresh token

app.get("/", (req, res) => {
  res.status(200).send("Kairo Backend");
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "HEALTH OK" });
});

app.use("/api/auth/", authRouter);
app.use("/api", profileRouter);

export default app;
