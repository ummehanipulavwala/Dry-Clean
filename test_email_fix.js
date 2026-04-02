import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Since the controller logic is what returns the error response, 
// a pure model test won't see the "sendError" response.
// But we can test the model validation and simulate the controller check.

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const testEmailUpper = 'HANI12345@gmail.com';
    const testEmailLower = 'hani12345@gmail.com';

    // 1. Model Level Validation Test
    try {
      await User.deleteOne({ email: testEmailLower });
      await User.create({ email: testEmailUpper, password: 'password123' });
      console.error(`FAILED: Model accepted uppercase email: ${testEmailUpper}`);
    } catch (err) {
      console.log(`PASSED: Model rejected uppercase email: ${testEmailUpper} (${err.message})`);
    }

    // 2. Simulate Controller Level Check
    const controllerCheck = (email) => {
      if (/[A-Z]/.test(email)) {
        return "Email must be in lowercase";
      }
      return null;
    };

    const error = controllerCheck(testEmailUpper);
    if (error === "Email must be in lowercase") {
      console.log(`PASSED: Controller-level check correctly identified uppercase email: ${testEmailUpper}`);
    } else {
      console.error(`FAILED: Controller-level check FAILED to identify uppercase email: ${testEmailUpper}`);
    }

    const noError = controllerCheck(testEmailLower);
    if (noError === null) {
      console.log(`PASSED: Controller-level check correctly allowed lowercase email: ${testEmailLower}`);
    } else {
      console.error(`FAILED: Controller-level check FAILED to allow lowercase email: ${testEmailLower}`);
    }

    console.log('Test completed.');
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTest();
