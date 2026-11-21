import { Worker } from "bullmq";
import { redisConnection, WebHookJobData } from "./hookQueue.js";
import { createHmacSignature } from "../utils/createHmac.js";
import { addEventLog } from "../webHookService/eventLog.js";

const worker = new Worker<WebHookJobData>(
  "hook-queue",
  async (job) => {
    const { eventId, endpointId, destinationURL, payload, secret } = job.data;

    const signature = createHmacSignature(payload, secret);
    const jobAttempt = job.attemptsMade + 1;
    const start = Date.now();
    try {
      const response = await fetch(destinationURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WebHook-Header": signature,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      const responseTime = Date.now() - start;
      if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`);
      }

      const result = await response.json();
      await addEventLog({
        eventId,
        endpointId,
        statusCode: response.status,
        responseTime,
        status: "SUCCESS",
        attempt: jobAttempt,
      });
    } catch (error: any) {
      const responseTime = Date.now() - start;
      let errorMessage = "Unknown Error."
      if(error instanceof Error){
        errorMessage = error.message
      }
      await addEventLog({
        eventId,
        endpointId,
        statusCode: error.status,
        responseTime,
        status: "FAILED",
        attempt: jobAttempt,
        error: errorMessage
      });
      throw error;
    }
  },
  { connection: redisConnection },
);
