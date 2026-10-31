
import 'dotenv/config';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dns from 'node:dns';
import User from '../models/User.js';

// Fix Node.js DNS resolution for MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    if (hidden) {
      // Print the prompt only; hide the characters being typed.
      rl._writeToOutput = (s) => {
        if (s.includes(question)) process.stdout.write(s);
      };
    }

    rl.question(question, (answer) => {
      rl.close();

      if (hidden) process.stdout.write('\n');

      resolve(answer.trim());
    });
  });
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in .env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully.');

  const name = await ask('Admin full name: ');
  const email = (await ask('Admin email: ')).toLowerCase();
  const password = await ask('Password (8+ characters): ', true);
  const again = await ask('Repeat password: ', true);

  if (name.length < 2) {
    throw new Error('Please enter a name.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email.');
  }

  if (password.length < 8 || password.length > 72) {
    throw new Error('Password must be 8 to 72 characters.');
  }

  if (password !== again) {
    throw new Error('Passwords do not match.');
  }

  if (await User.exists({ email })) {
    throw new Error('An account with this email already exists.');
  }

  await User.create({
    name,
    email,
    role: 'admin',
    passwordHash: await bcrypt.hash(password, 12)
  });

  console.log(
    `\nAdmin account created for ${email}. You can now log in at /admin/login.`
  );
}

main()
  .catch((err) => {
    console.error(`\nError: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
