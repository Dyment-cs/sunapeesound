const twilio = require('twilio');
const { dbRun } = require('../database/db');

// Initialize Twilio client
let twilioClient = null;

const initTwilio = () => {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        console.log('Twilio SMS service initialized');
    } else {
        console.warn('Twilio not configured. Set TWILIO_* environment variables to enable SMS.');
    }
};

initTwilio();

/**
 * Send SMS message
 * @param {string} to - Phone number in E.164 format
 * @param {string} message - Message text
 * @param {string} type - Type of SMS (for logging)
 */
const sendSMS = async (to, message, type = 'general') => {
    try {
        if (!twilioClient) {
            console.log(`[SMS Disabled] Would send to ${to}: ${message}`);
            await logSMS(to, message, type, 'disabled', 'SMS service not configured');
            return { success: false, message: 'SMS service not configured' };
        }

        // Ensure phone number is in E.164 format
        const formattedPhone = formatPhoneNumber(to);

        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        await logSMS(to, message, type, 'sent', null);
        console.log(`SMS sent to ${to}: ${result.sid}`);

        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Error sending SMS:', error);
        await logSMS(to, message, type, 'failed', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Format phone number to E.164 format (+1XXXXXXXXXX for US)
 */
const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If it's 10 digits, assume US and add +1
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    }

    // If it's 11 digits and starts with 1, add +
    if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+${cleaned}`;
    }

    // If it already has +, return as is
    if (phone.startsWith('+')) {
        return phone;
    }

    // Default: assume US and add +1
    return `+1${cleaned}`;
};

/**
 * Log SMS to database
 */
const logSMS = async (phone, message, type, status, errorMessage = null) => {
    try {
        await dbRun(
            `INSERT INTO sms_log (recipient_phone, message, type, status, error_message)
             VALUES (?, ?, ?, ?, ?)`,
            [phone, message, type, status, errorMessage]
        );
    } catch (error) {
        console.error('Error logging SMS:', error);
    }
};

/**
 * Send notification welcome SMS
 */
const sendNotificationWelcomeSMS = async (phone, firstName) => {
    const message = `🎵 Hey ${firstName}! Welcome to Sunapee Sound notifications. You'll get alerts for upcoming events. Reply STOP to unsubscribe anytime. - Sunapee Sound Project`;
    return await sendSMS(phone, message, 'notification_welcome');
};

/**
 * Send open mic confirmation SMS
 */
const sendOpenMicConfirmationSMS = async (phone, name, date, timeSlot, isReserve) => {
    const message = isReserve
        ? `🎤 Hey ${name}! You're on the reserve list for Open Mic on ${date}. We'll text if a spot opens. - Sunapee Sound`
        : `🎤 Confirmed ${name}! Open Mic on ${date} at ${timeSlot}. 15 min slot. See you at Hoptimystic! - Sunapee Sound`;

    return await sendSMS(phone, message, 'openmic_confirmation');
};

/**
 * Send event notification SMS
 */
const sendEventNotificationSMS = async (phone, eventTitle, eventDate) => {
    const message = `🎵 Reminder: ${eventTitle} on ${eventDate}! Don't miss it! - Sunapee Sound Project`;
    return await sendSMS(phone, message, 'event_notification');
};

module.exports = {
    sendSMS,
    formatPhoneNumber,
    sendNotificationWelcomeSMS,
    sendOpenMicConfirmationSMS,
    sendEventNotificationSMS
};
