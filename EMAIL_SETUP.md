# Email Configuration Guide

This guide explains how to set up email notifications for booking confirmations.

## Email Setup

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Copy the 16-character password

3. **Update .env file**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-salon-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=Naomi's Barbershop <your-salon-email@gmail.com>
SALON_NAME=Naomi's Barbershop
SALON_PHONE=+373 68 123 456
SALON_ADDRESS=Strada Centrală 123, Chișinău, Moldova
```

### 2. Other Email Providers

#### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### Custom SMTP
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## Testing Email Configuration

1. **Start the backend server**
2. **Login to admin panel** (admin / admin123)
3. **Test endpoint**: `GET http://localhost:3001/api/admin/test-email`

## Email Features

✅ **Automatic booking confirmations** - Sent when customers provide email
✅ **Professional HTML templates** - Beautiful, mobile-friendly design
✅ **Romanian language** - All content in Romanian
✅ **Booking details included** - Service, date, time, customer info
✅ **Salon branding** - Your salon name, address, phone
✅ **Error handling** - Bookings work even if email fails

## Email Template Features

- **Responsive design** - Works on all devices
- **Professional styling** - Yellow/gold salon theme
- **Complete booking details** - All information included
- **Important reminders** - Arrival time, cancellation policy
- **Contact information** - Your salon details
- **Both HTML and text** - Fallback for all email clients

## Security & Privacy

- **No customer data stored** unnecessarily
- **Secure email transmission** via TLS
- **Failed emails logged** for monitoring
- **Optional feature** - Works without email too

## Troubleshooting

### Email not sending?
1. Check internet connection
2. Verify email credentials in .env
3. Test email config via admin endpoint
4. Check spam folder
5. Enable "Less secure app access" if needed

### Common Issues
- **App passwords required** for Gmail with 2FA
- **Port 587 or 465** depending on provider  
- **TLS/SSL settings** may need adjustment
- **Firewall blocking** SMTP ports

## Production Deployment

For production, consider:
- **Professional email service** (SendGrid, Mailgun, AWS SES)
- **Domain-based email** (salon@yourdomain.com)
- **Email delivery monitoring**
- **Proper DNS records** (SPF, DKIM)