import { Queue } from "bullmq";
import { redis } from "../lib/redis";

export const connection = {redis};

export const workflowQueue = new Queue("workflow-execution", {connection})
