-- Sunapee Sound Project Database Schema

-- Notification Signups Table
CREATE TABLE IF NOT EXISTS notification_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    notify_email BOOLEAN DEFAULT 1,
    notify_sms BOOLEAN DEFAULT 0,
    type_livestream BOOLEAN DEFAULT 1,
    type_events BOOLEAN DEFAULT 1,
    type_announcements BOOLEAN DEFAULT 0,
    timing TEXT DEFAULT '1hour',
    source TEXT DEFAULT 'website',
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed BOOLEAN DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter Signups Table
CREATE TABLE IF NOT EXISTS newsletter_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Open Mic Signups Table
CREATE TABLE IF NOT EXISTS openmic_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    time_slot TEXT,
    performance_details TEXT,
    is_reserve BOOLEAN DEFAULT 0,
    signup_date DATE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    venue TEXT,
    description TEXT,
    link TEXT,
    source TEXT DEFAULT 'sunapee_sound',
    tags TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Log Table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    type TEXT,
    status TEXT DEFAULT 'sent',
    error_message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SMS Log Table (for tracking sent SMS)
CREATE TABLE IF NOT EXISTS sms_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_phone TEXT NOT NULL,
    message TEXT,
    type TEXT,
    status TEXT DEFAULT 'sent',
    error_message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_email ON notification_signups(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_signups(email);
CREATE INDEX IF NOT EXISTS idx_openmic_date ON openmic_signups(signup_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_notification_active ON notification_signups(active);
