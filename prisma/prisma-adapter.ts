import { PrismaPg } from "@prisma/adapter-pg";

export const prismaPgAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});