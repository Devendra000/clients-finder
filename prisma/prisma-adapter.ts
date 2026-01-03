import { PrismaPg } from "@prisma/adapter-pg";
import { log } from "console";
import {config} from 'dotenv';

config();
log('Using DATABASE_URL:', process.env.DATABASE_URL);
export const prismaPgAdapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL
});