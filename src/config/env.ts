import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
};