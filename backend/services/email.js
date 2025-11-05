const nodemailer = require('nodemailer');
const { dbRun } = require('../database/db');

// Create email transporter
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        console.warn('Email not configured. Set EMAIL_* environment variables to enable email sending.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

const transporter = createTransporter();

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 * @param {string} type - Type of email (for logging)
 */
const sendEmail = async (to, subject, html, text, type = 'general') => {
    try {
        if (!transporter) {
            console.log(`[Email Disabled] Would send to ${to}: ${subject}`);
            await logEmail(to, subject, type, 'disabled', 'Email service not configured');
            return { success: false, message: 'Email service not configured' };
        }

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME || 'Sunapee Sound Project'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
        };

        const info = await transporter.sendMail(mailOptions);
        await logEmail(to, subject, type, 'sent', null);

        console.log(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        await logEmail(to, subject, type, 'failed', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Log email to database
 */
const logEmail = async (email, subject, type, status, errorMessage = null) => {
    try {
        await dbRun(
            `INSERT INTO email_log (recipient_email, subject, type, status, error_message)
             VALUES (?, ?, ?, ?, ?)`,
            [email, subject, type, status, errorMessage]
        );
    } catch (error) {
        console.error('Error logging email:', error);
    }
};

/**
 * Send welcome email to notification signup
 */
const sendNotificationWelcome = async (email, firstName, preferences) => {
    const subject = '🎵 Welcome to Sunapee Sound Notifications!';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: #F5E6D3; padding: 30px; text-align: center;">
                <h1 style="color: #D4AF37; margin: 0;">🎵 Sunapee Sound Project</h1>
                <p style="font-size: 1.2em; margin: 10px 0 0 0;">Where the Harbor Finds Its Voice</p>
            </div>

            <div style="background: white; padding: 30px; color: #333;">
                <h2 style="color: #6B1C23;">Welcome, ${firstName}! 🎉</h2>

                <p>Thanks for signing up for notifications! You're now part of the Sunapee Sound community.</p>

                <div style="background: #faf8f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                    <h3 style="color: #6B1C23; margin-top: 0;">Your Preferences:</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${preferences.notifyEmail ? '<li>✓ Email notifications</li>' : ''}
                        ${preferences.notifySMS ? '<li>✓ SMS notifications</li>' : ''}
                    </ul>
                    <ul style="list-style: none; padding: 0; margin-top: 15px;">
                        ${preferences.typeLivestream ? '<li>🔴 Livestream alerts</li>' : ''}
                        ${preferences.typeEvents ? '<li>📅 Community events</li>' : ''}
                        ${preferences.typeAnnouncements ? '<li>📢 Special announcements</li>' : ''}
                    </ul>
                    <p style="margin-bottom: 0;"><strong>Timing:</strong> ${preferences.timing === '1hour' ? '1 hour before' : preferences.timing === 'day' ? '1 day before' : '1 week before'}</p>
                </div>

                <p>You'll receive your first notification when we have an upcoming event!</p>

                <p style="margin-top: 30px;">
                    <a href="https://sunapeesound.com" style="background: linear-gradient(135deg, #D4AF37, #E5C158); color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Visit Our Website</a>
                </p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
                <p>You can unsubscribe anytime by replying to this email with "unsubscribe".</p>
                <p>Sunapee Sound Project | Sunapee Harbor, NH</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html, null, 'notification_welcome');
};

/**
 * Send newsletter welcome email
 */
const sendNewsletterWelcome = async (email, name) => {
    const subject = '📬 Welcome to Sunapee Sound Newsletter';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: #F5E6D3; padding: 30px; text-align: center;">
                <h1 style="color: #D4AF37; margin: 0;">🎵 Sunapee Sound Project</h1>
            </div>

            <div style="background: white; padding: 30px; color: #333;">
                <h2 style="color: #6B1C23;">Welcome, ${name}!</h2>
                <p>Thanks for subscribing to our newsletter! You'll receive weekly updates about upcoming events, performer lineups, and news about the Sunapee Sound Project.</p>
                <p>Stay tuned for great music every Friday night! 🎸</p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
                <p>Sunapee Sound Project | Sunapee Harbor, NH</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html, null, 'newsletter_welcome');
};

/**
 * Send open mic confirmation
 */
const sendOpenMicConfirmation = async (email, name, date, timeSlot, isReserve) => {
    const subject = isReserve ? '🎤 You\'re on the Reserve List!' : '🎤 Open Mic Confirmed!';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); color: #F5E6D3; padding: 30px; text-align: center;">
                <h1 style="color: #D4AF37; margin: 0;">🎤 Open Mic at Hoptimystic</h1>
            </div>

            <div style="background: white; padding: 30px; color: #333;">
                <h2 style="color: #6B1C23;">Hey ${name}! 🎵</h2>

                ${isReserve ?
                    `<p>You're on the <strong>reserve list</strong> for Open Mic Night on <strong>${date}</strong>.</p>
                     <p>We'll contact you if a spot opens up!</p>` :
                    `<p>Your spot is confirmed for Open Mic Night!</p>
                     <div style="background: #faf8f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Time Slot:</strong> ${timeSlot}</p>
                     </div>
                     <p><strong>Remember:</strong> Each performer gets a 15-minute slot.</p>`
                }

                <p><strong>Location:</strong> Hoptimystic, Sunapee Harbor</p>

                <p style="margin-top: 30px; padding-top: 30px; border-top: 2px solid #f0f0f0;">
                    See you there! Can't wait to hear you perform! 🎸
                </p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 0.9em;">
                <p>Sunapee Sound Project | Sunapee Harbor, NH</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html, null, 'openmic_confirmation');
};

module.exports = {
    sendEmail,
    sendNotificationWelcome,
    sendNewsletterWelcome,
    sendOpenMicConfirmation
};
