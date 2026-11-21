import { Queue } from "bullmq";
import "dotenv";

export const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.PORT) || 6379,
};
export interface WebHookJobData {
  eventId: string;
  endpointId: string;
  destinationURL: string;
  payload: Record<string, unknown>;
  secret: string;
}
export const hookQueue = new Queue<WebHookJobData>("hook-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
  },
});
