import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && accountSid.startsWith("AC") && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn("Twilio credentials missing or invalid (must start with 'AC'). SMS sending will be simulated via console logs.");
}

/**
 * Send an SMS to a customer
 * @param {string} to - Recipient phone number
 * @param {string} body - SMS content
 */
export const sendSMS = async (to, body) => {
    try {
        if (!client) {
            console.log("Twilio client not initialized. SMS Body:", body);
            return { success: false, message: "Twilio credentials missing" };
        }

        const message = await client.messages.create({
            body,
            from: fromPhoneNumber,
            to: to.startsWith("+") ? to : `+91${to}`, // Assuming Indian numbers if no prefix
        });

        console.log(`SMS sent successfully to ${to}: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};
