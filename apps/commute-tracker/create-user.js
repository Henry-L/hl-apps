/**
 * Script to create users manually
 * Usage: node create-user.js <username> <password>
 */

const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcryptjs');

const firestore = new Firestore();

async function createUser(username, password) {
  try {
    // Check if user exists
    const existing = await firestore.collection('users')
      .where('username', '==', username)
      .get();
    
    if (!existing.empty) {
      console.error(`User "${username}" already exists!`);
      process.exit(1);
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const userRef = await firestore.collection('users').add({
      username,
      passwordHash,
      createdAt: new Date().toISOString()
    });
    
    console.log(`✅ User "${username}" created successfully!`);
    console.log(`User ID: ${userRef.id}`);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

// Get args
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node create-user.js <username> <password>');
  process.exit(1);
}

createUser(username, password);

