# SendGrid Integration Setup Guide

This guide will help you set up SendGrid for automated email notifications in the Digital Library System.

## 🚀 Quick Setup

### 1. Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com) and create a free account
2. Verify your email address
3. Complete the account setup process

### 2. Create API Key
1. Log into your SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** and configure permissions:
   - **Mail Send**: Full Access
   - **Template Engine**: Read Access (optional)
   - **Suppressions**: Read Access (optional)
5. Copy the generated API key (you won't see it again!)

### 3. Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Choose one of these options:

#### Option A: Single Sender Verification (Easiest)
1. Click **Verify a Single Sender**
2. Fill in your details:
   - From Name: `Digital Library System`
   - From Email: `noreply@yourdomain.com`
   - Reply To: `support@yourdomain.com`
3. Check your email and click the verification link

#### Option B: Domain Authentication (Recommended for Production)
1. Click **Authenticate Your Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Add the provided DNS records to your domain
4. Wait for verification (can take up to 48 hours)

### 4. Configure Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Copy from .env.example
cp backend/.env.example backend/.env
```

Edit the `.env` file with your SendGrid credentials:

```env
# SendGrid Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Digital Library System
REPLY_TO_EMAIL=support@yourdomain.com

# Optional: Enable debug mode for testing
APP_DEBUG=true
```

### 5. Test Email Sending
Run the notification scheduler to test email delivery:

```bash
cd backend
php utils/notification-scheduler.php
```

Or test through the web interface:
1. Login as a librarian
2. Go to **Notifications** → **Dashboard**
3. Click **Send Notification**
4. Send a test message

## 📧 Email Templates

The system includes professional HTML email templates for:

- **Due Date Reminders**: Sent 3 days and 1 day before due date
- **Overdue Alerts**: Sent 1, 3, and 7 days after due date
- **Reservation Notifications**: When reserved books become available
- **Fine Reminders**: For outstanding library fines
- **Transaction Alerts**: Book issues, returns, and payments

### Template Features
- Responsive design for mobile and desktop
- Color-coded urgency levels
- Professional branding
- Clear call-to-action buttons
- Fallback text for email clients that don't support HTML

## 🔄 Automated Scheduling

### Cron Job Setup (Linux/Mac)
Add this to your crontab to run notifications every hour:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 * * * * cd /path/to/your/project/backend && php utils/notification-scheduler.php >> /var/log/library-notifications.log 2>&1
```

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily, repeat every 1 hour
4. Action: Start a program
5. Program: `php`
6. Arguments: `utils/notification-scheduler.php`
7. Start in: `C:\path\to\your\project\backend`

### Manual Execution
You can also run notifications manually:

```bash
# From backend directory
php utils/notification-scheduler.php

# Or through the web interface (librarian login required)
# Navigate to: /librarian/notifications → Run Scheduler
```

## 📊 Monitoring & Analytics

### SendGrid Dashboard
Monitor email performance in your SendGrid dashboard:
- **Activity Feed**: Real-time email events
- **Stats**: Delivery rates, opens, clicks
- **Suppressions**: Bounced/blocked emails

### Application Logs
Check notification logs in the system:
1. Login as librarian
2. Go to **Notifications** → **Notification Logs**
3. Filter by date, type, or status

### Database Tables
The system creates these tables for tracking:
- `notification_logs`: All sent notifications
- `notification_settings`: User preferences

## 🛠️ Troubleshooting

### Common Issues

#### 1. "SMTP Error: Could not authenticate"
- **Cause**: Invalid API key or incorrect SMTP settings
- **Solution**: 
  - Verify your API key is correct
  - Ensure `SMTP_USERNAME=apikey` (literal word "apikey")
  - Check that `SMTP_PASSWORD` matches your API key

#### 2. "Sender address not verified"
- **Cause**: From email address not verified in SendGrid
- **Solution**: Complete sender verification in SendGrid dashboard

#### 3. Emails not being delivered
- **Cause**: Various reasons (spam filters, invalid addresses, etc.)
- **Solution**: 
  - Check SendGrid Activity Feed
  - Verify recipient email addresses
  - Check spam folders
  - Review suppression lists

#### 4. "Permission denied" errors
- **Cause**: Insufficient API key permissions
- **Solution**: Recreate API key with proper permissions (Mail Send: Full Access)

### Debug Mode
Enable debug mode for detailed SMTP logs:

```env
APP_DEBUG=true
```

This will output detailed SMTP communication to error logs.

### Test Email Delivery
Use this simple test script:

```php
<?php
// test-email.php
require_once 'vendor/autoload.php';
require_once 'config/database.php';
require_once 'utils/notification-service.php';

$db = Database::getInstance()->getConnection();
$service = new NotificationService($db);

$result = $service->sendEmail(
    'your-email@example.com',
    'Test User',
    'Test Email from Library System',
    'This is a test email to verify SendGrid integration.'
);

var_dump($result);
?>
```

## 🔒 Security Best Practices

1. **Never commit API keys**: Keep `.env` file out of version control
2. **Use environment variables**: Don't hardcode credentials
3. **Restrict API permissions**: Only grant necessary permissions
4. **Monitor usage**: Watch for unusual sending patterns
5. **Rotate keys regularly**: Update API keys periodically

## 📈 Scaling Considerations

### Free Tier Limits
SendGrid free tier includes:
- 100 emails/day
- Basic email analytics
- Single sender verification

### Paid Plans
For higher volume:
- **Essentials**: $14.95/month, 50K emails
- **Pro**: $89.95/month, 1.5M emails
- **Premier**: Custom pricing, unlimited emails

### Performance Optimization
- **Batch processing**: Group notifications to reduce API calls
- **Rate limiting**: Respect SendGrid's rate limits
- **Error handling**: Implement retry logic for failed sends
- **Queue system**: Use job queues for high-volume sending

## 🎯 Next Steps

1. **Set up monitoring**: Configure alerts for failed deliveries
2. **Customize templates**: Modify email templates to match your branding
3. **Add SMS integration**: Integrate Twilio for SMS notifications
4. **Implement webhooks**: Use SendGrid webhooks for delivery tracking
5. **A/B testing**: Test different email templates and timing

## 📞 Support

- **SendGrid Documentation**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **SendGrid Support**: Available through dashboard
- **Library System Issues**: Check application logs and notification dashboard

---

**Note**: This integration uses PHPMailer with SendGrid's SMTP service for reliable email delivery. The system is designed to gracefully handle failures and provide detailed logging for troubleshooting.