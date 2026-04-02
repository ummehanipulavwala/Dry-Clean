import mongoose from 'mongoose';
import Message from './models/Message.js';
import Chat from './models/Chat.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create a dummy chat if it doesn't exist
    let chat = await Chat.findOne();
    if (!chat) {
        console.error("No chats found in DB. Please run this after some chat data is created.");
        process.exit(1);
    }
    const chatId = chat._id;
    console.log(`Using chatId: ${chatId}`);

    // 2. Clear existing messages for this test (be careful on production, using a mock is better)
    // await Message.deleteMany({ chatId });
    
    // 3. Create 5 test messages with small delays
    for (let i = 1; i <= 5; i++) {
        await Message.create({
            chatId,
            sender: chat.members[0],
            text: `Message ${i}`,
            time: '12:00 PM',
            date: '01-01-2026'
        });
        await new Promise(r => setTimeout(r, 100)); // Small delay to ensure unique createdAt
    }

    // 4. Test Sorting (Newest First)
    const messages = await Message.find({ chatId })
        .sort({ createdAt: -1 })
        .limit(2);
    
    console.log('--- Sorting Test (Newest First) ---');
    messages.forEach(m => console.log(`${m.createdAt}: ${m.text}`));
    
    if (messages[0].text === 'Message 5' && messages[1].text === 'Message 4') {
        console.log('PASSED: Newest messages "Message 5" and "Message 4" returned first.');
    } else {
        console.error('FAILED: Incorrect sort order.');
    }

    // 5. Test Pagination (Page 2)
    const limit = 2;
    const page = 2;
    const skip = (page - 1) * limit;
    
    const paginatedMessages = await Message.find({ chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    console.log(`--- Pagination Test (Page ${page}, Limit ${limit}) ---`);
    paginatedMessages.forEach(m => console.log(`${m.createdAt}: ${m.text}`));

    if (paginatedMessages[0].text === 'Message 3' && paginatedMessages[1].text === 'Message 2') {
        console.log('PASSED: Page 2 correctly returned "Message 3" and "Message 2".');
    } else {
        console.error('FAILED: Pagination logic error.');
    }

    console.log('Test completed.');
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTest();
