import { config } from 'dotenv';
import path from 'path';

// Load .env.test so the app uses the test DB
config({ path: path.resolve(process.cwd(), '.env.test') });