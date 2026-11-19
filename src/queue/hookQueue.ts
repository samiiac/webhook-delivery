import { Queue } from "bullmq";
import "dotenv";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.PORT) || 6379,
};
export interface webHookJobData {
  eventId: string;
  endpointId: string;
  destinationURL: string;
  payload: Record<string, unknown>;
  signature: string;
}
export const hookQueue = new Queue<webHookJobData>("hook-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
  },
});
