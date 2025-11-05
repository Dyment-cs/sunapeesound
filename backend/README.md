# Sunapee Sound Project - Backend API

A comprehensive backend API for the Sunapee Sound Project, handling notifications, open mic signups, newsletter subscriptions, and event management.

## Features

- **Notification Signups**: Collect user preferences for email/SMS notifications
- **Open Mic Management**: Handle performer signups and schedules
- **Newsletter**: Manage newsletter subscriptions
- **Events**: Create and manage community events
- **Email Service**: Automated welcome and confirmation emails
- **SMS Service**: Text message notifications via Twilio

## Tech Stack

- Node.js + Express
- SQLite database
- Nodemailer (email)
- Twilio (SMS)
- Security: Helmet, CORS, Rate Limiting

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3000
CORS_ORIGIN=*

# Email (example with Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Sunapee Sound Project

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on http://localhost:3000

## API Endpoints

### Notifications

#### Sign Up for Notifications
```http
POST /api/notifications/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "(603) 555-1234",
  "preferences": {
    "notifyEmail": true,
    "notifySMS": true,
    "typeLivestream": true,
    "typeEvents": true,
    "typeAnnouncements": false,
    "timing": "1hour"
  }
}
```

#### Get All Signups (Admin)
```http
GET /api/notifications
```

#### Unsubscribe
```http
DELETE /api/notifications/:email
```

### Open Mic

#### Sign Up for Open Mic
```http
POST /api/openmic/signup
Content-Type: application/json

{
  "performerName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "(603) 555-5678",
  "timeSlot": "6:00 PM",
  "performanceDetails": "Acoustic guitar, 2 original songs",
  "isReserve": false,
  "signupDate": "2024-01-19"
}
```

#### Get Schedule for Date
```http
GET /api/openmic/schedule/2024-01-19
```

#### Get All Schedules
```http
GET /api/openmic/schedule
```

#### Cancel Signup
```http
DELETE /api/openmic/:id
```

### Newsletter

#### Sign Up for Newsletter
```http
POST /api/newsletter/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Get All Subscribers (Admin)
```http
GET /api/newsletter
```

#### Unsubscribe
```http
DELETE /api/newsletter/:email
```

### Events

#### Get All Events
```http
GET /api/events
GET /api/events?upcoming=true&limit=10
```

#### Get Single Event
```http
GET /api/events/:id
```

#### Create Event (Admin)
```http
POST /api/events
Content-Type: application/json

{
  "title": "Open Mic Night",
  "date": "2024-01-19",
  "venue": "Hoptimystic",
  "description": "Weekly open mic event",
  "link": "https://sunapeesound.com/openmic",
  "tags": "openmic,live-music"
}
```

#### Update Event (Admin)
```http
PUT /api/events/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "date": "2024-01-19",
  ...
}
```

#### Delete Event
```http
DELETE /api/events/:id
```

## Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this App Password in your `.env` file

### Other Email Providers

- **Mailgun**: SMTP settings at https://www.mailgun.com/
- **SendGrid**: SMTP settings at https://sendgrid.com/
- **Amazon SES**: SMTP settings at https://aws.amazon.com/ses/

## SMS Configuration

### Twilio Setup

1. Sign up at https://www.twilio.com
2. Get a phone number
3. Find your Account SID and Auth Token in the console
4. Add to `.env` file

**Note**: SMS is optional. The system will work without it.

## Database

The backend uses SQLite for simplicity. The database file is created at `backend/database/sunapee_sound.db`.

### Tables

- `notification_signups`: User notification preferences
- `newsletter_signups`: Newsletter subscribers
- `openmic_signups`: Open mic performer signups
- `events`: Community events
- `email_log`: Email sending logs
- `sms_log`: SMS sending logs

### Viewing the Database

```bash
sqlite3 database/sunapee_sound.db
.tables
SELECT * FROM notification_signups;
.quit
```

## Deployment

### Option 1: Heroku

1. Install Heroku CLI
2. Create app: `heroku create sunapee-sound-api`
3. Set environment variables: `heroku config:set EMAIL_HOST=...`
4. Deploy: `git push heroku main`

### Option 2: DigitalOcean App Platform

1. Connect your GitHub repo
2. Set environment variables in the dashboard
3. Deploy automatically on push

### Option 3: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd backend
npm install
npm run init-db

# Use PM2 to keep running
sudo npm install -g pm2
pm2 start server.js --name sunapee-sound
pm2 startup
pm2 save
```

## Security Notes

- The current implementation has no authentication for admin endpoints
- For production, add authentication middleware to protect:
  - GET /api/notifications
  - GET /api/newsletter
  - POST/PUT/DELETE /api/events
- Consider using JWT tokens or API keys
- Always use HTTPS in production
- Set `CORS_ORIGIN` to your specific domain

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Signup endpoints: 5 signups per hour per IP

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Email Not Sending
- Check your SMTP credentials
- For Gmail, ensure you're using an App Password
- Check the email_log table for error messages

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (should be E.164: +1XXXXXXXXXX)
- Check the sms_log table for error messages

## Support

For issues or questions:
- GitHub Issues: [your-repo/issues]
- Email: info@sunapeesound.org

## License

MIT
