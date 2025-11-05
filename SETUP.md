# Sunapee Sound Project - Complete Setup Guide

This guide will help you set up both the frontend and backend for the Sunapee Sound Project.

## Project Structure

```
sunapeesound/
├── index.html                  # Main website
├── notification-signup-form.html  # Notification signup page
├── logo.png                    # Project logo
├── open-mic-poster.png        # Open mic poster
├── backend/                    # Backend API
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables (create this)
│   ├── database/              # Database files
│   │   ├── db.js             # Database connection
│   │   ├── schema.sql        # Database schema
│   │   └── init-db.js        # Database initialization script
│   ├── routes/                # API routes
│   │   ├── notifications.js  # Notification endpoints
│   │   ├── openmic.js        # Open mic endpoints
│   │   ├── newsletter.js     # Newsletter endpoints
│   │   └── events.js         # Events endpoints
│   └── services/              # External services
│       ├── email.js          # Email service (Nodemailer)
│       └── sms.js            # SMS service (Twilio)
└── SETUP.md                   # This file
```

## Quick Start

### 1. Backend Setup

#### Install Node.js

If you don't have Node.js installed:
- Download from https://nodejs.org/ (LTS version recommended)
- Or use a version manager like nvm

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Email Configuration (Optional - for sending emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Sunapee Sound Project

# SMS Configuration (Optional - for sending SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Note:** Email and SMS are optional. The backend will work without them, but confirmation messages won't be sent.

#### Initialize Database

```bash
npm run init-db
```

This creates the SQLite database with all required tables.

#### Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on http://localhost:3000

You should see:
```
╔═══════════════════════════════════════════════╗
║   🎵 Sunapee Sound Project API Server 🎵     ║
╠═══════════════════════════════════════════════╣
║   Server running on port 3000                 ║
...
```

### 2. Frontend Setup

#### Local Development

For local testing, you can use any static file server. Here are a few options:

**Option 1: Python (if you have Python installed)**
```bash
# From the project root directory
python3 -m http.server 8000
```
Then visit http://localhost:8000

**Option 2: Node.js http-server**
```bash
npm install -g http-server
http-server -p 8000
```
Then visit http://localhost:8000

**Option 3: VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

The frontend will automatically connect to the backend at http://localhost:3000

## Email Configuration (Optional)

### Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Add to `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd-efgh-ijkl-mnop  # Your app password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Sunapee Sound Project
   ```

### Other Email Providers

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

## SMS Configuration (Optional)

### Using Twilio

1. Sign up at https://www.twilio.com
2. Get a phone number from the console
3. Find your Account SID and Auth Token
4. Add to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Note:** Twilio offers a free trial with limited credits.

## Testing the Setup

### 1. Test Backend API

Open http://localhost:3000 in your browser. You should see:

```json
{
  "message": "Sunapee Sound Project API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 2. Test Notification Signup

Visit http://localhost:8000/notification-signup-form.html

Fill out the form and submit. Check:
- Browser console for any errors
- Backend terminal for request logs
- Your email (if configured) for confirmation

### 3. Test Open Mic Signup

Visit http://localhost:8000 and scroll to the "Open Mic Signups" section.

Fill out the form and submit. You should see your name appear in the schedule.

### 4. Test Newsletter Signup

Scroll to the "Newsletter" section on the main page.

Enter your name and email, then submit.

## Troubleshooting

### Backend won't start

**Port already in use:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port in .env
PORT=3001
```

**Database errors:**
```bash
# Reinitialize the database
rm backend/database/*.db
npm run init-db
```

### Frontend can't connect to backend

**CORS errors:**
- Make sure the backend is running
- Check that `CORS_ORIGIN=*` in your `.env` file
- Try restarting the backend

**Wrong API URL:**
- The frontend automatically detects localhost vs production
- For custom setups, edit the `API_URL` in:
  - `notification-signup-form.html` (line ~618)
  - `index.html` (lines ~1690, ~1760)

### Emails not sending

- Check your SMTP credentials in `.env`
- For Gmail, make sure you're using an App Password, not your regular password
- Check the `email_log` table in the database for error messages:
  ```bash
  cd backend/database
  sqlite3 sunapee_sound.db
  SELECT * FROM email_log ORDER BY sent_at DESC LIMIT 10;
  .quit
  ```

### SMS not sending

- Verify Twilio credentials in `.env`
- Check that your phone number is in E.164 format (+1XXXXXXXXXX)
- Check the `sms_log` table:
  ```bash
  cd backend/database
  sqlite3 sunapee_sound.db
  SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 10;
  .quit
  ```

## Database Management

### View the Database

```bash
cd backend/database
sqlite3 sunapee_sound.db

# List tables
.tables

# View notification signups
SELECT * FROM notification_signups;

# View open mic signups
SELECT * FROM openmic_signups ORDER BY created_at DESC;

# View newsletter subscribers
SELECT * FROM newsletter_signups;

# Exit
.quit
```

### Backup the Database

```bash
cp backend/database/sunapee_sound.db backend/database/backup_$(date +%Y%m%d).db
```

### Clear test data

```bash
cd backend/database
sqlite3 sunapee_sound.db

DELETE FROM notification_signups;
DELETE FROM openmic_signups;
DELETE FROM newsletter_signups;
DELETE FROM email_log;
DELETE FROM sms_log;

.quit
```

## Production Deployment

### Update API URLs

Before deploying to production, update the API URLs in the frontend:

1. In `notification-signup-form.html` (around line 620):
   ```javascript
   const API_URL = 'https://api.sunapeesound.com/api';
   ```

2. In `index.html` (around lines 1690 and 1760):
   ```javascript
   const API_URL = 'https://api.sunapeesound.com/api';
   ```

### Deploy Backend

See `backend/README.md` for detailed deployment instructions for:
- Heroku
- DigitalOcean App Platform
- VPS (Ubuntu)

### Deploy Frontend

The frontend is static HTML/CSS/JS and can be hosted on:
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Any web hosting service

### Security Considerations

For production:
1. Set `CORS_ORIGIN` to your specific domain
2. Add authentication to admin endpoints
3. Use HTTPS for both frontend and backend
4. Set `NODE_ENV=production` in `.env`
5. Consider using a managed database (PostgreSQL) instead of SQLite
6. Implement rate limiting (already included)
7. Keep your `.env` file secure and never commit it to Git

## Support

For issues or questions:
- Check the logs: Backend terminal shows request/error logs
- Check the database: See Database Management section above
- Email: info@sunapeesound.org
- GitHub Issues: [your-repo/issues]

## License

MIT
