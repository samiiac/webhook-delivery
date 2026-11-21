import { prisma } from "../db/prisma.js";

export async function addEventLog(params: {
  eventId: string;
  endpointId: string;
  statusCode: number;
  responseTime: number;
  status: "SUCCESS" | "FAILED";
  attempt: number;
  error?: string;
}) {
    return prisma.eventLog.create({data:params})
}
