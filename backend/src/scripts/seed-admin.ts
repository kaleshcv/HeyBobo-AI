/**
 * Seed script: creates a default admin user if one doesn't already exist.
 *
 * Usage:  npx ts-node -r tsconfig-paths/register src/scripts/seed-admin.ts
 *   OR:   npm run seed:admin
 */
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduplatform';

const ADMIN_EMAIL = 'admin@eduplatform.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_USERNAME = 'admin';
const ADMIN_NAME = 'Platform Admin';

async function seed() {
  console.log('Connecting to MongoDB …');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected ✓');

  const db = client.db();
  const usersCol = db.collection('users');

  const existing = await usersCol.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user already exists (${ADMIN_EMAIL}). Ensuring role is admin …`);
    if (existing.role !== 'admin') {
      await usersCol.updateOne({ _id: existing._id }, { $set: { role: 'admin' } });
      console.log('Role updated to admin ✓');
    } else {
      console.log('Already has admin role ✓');
    }
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const now = new Date();
    await usersCol.insertOne({
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log('Admin user created ✓');
  }

  console.log('\n========================================');
  console.log('  Admin Credentials');
  console.log('========================================');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('========================================\n');

  await client.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
