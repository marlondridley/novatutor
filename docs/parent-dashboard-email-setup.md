# Parent Dashboard Email Setup

This guide explains how to set up Gmail for sending weekly email reports from the Parent Dashboard.

## Prerequisites

- A Gmail account
- Access to Google Account settings

## Steps to Configure Gmail

### 1. Enable 2-Factor Authentication (if not already enabled)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", enable "2-Step Verification"
3. Follow the prompts to set it up

### 2. Generate an App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. In the "Select app" dropdown, choose "Mail"
3. In the "Select device" dropdown, choose "Other" and enter "Study Coach"
4. Click "Generate"
5. Copy the 16-character password (shown without spaces)

### 3. Add Environment Variables

Add these variables to your `.env.local` file:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

**Important:** 
- Use the App Password, NOT your regular Gmail password
- Keep these credentials secure and never commit them to version control
- The `.env.local` file should be in your `.gitignore`

### 4. Test the Email Functionality

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Parent Dashboard
3. Click "Send Weekly Email"
4. Check the email address associated with your logged-in account

## Email Features

The weekly email report includes:

- **Key Metrics:** Total study time, subjects practiced, questions asked
- **Notable Achievements:** Milestones and accomplishments
- **Strengths Observed:** Positive learning behaviors
- **Areas for Growth:** Opportunities for improvement
- **Daily Activity:** Detailed breakdown of each study session
- **AI Insights:** Study Coach notes and recommendations

## Download Report Feature

The "Download Report" button generates an HTML file that can be:
- Opened in any web browser
- Printed to PDF
- Shared with teachers or tutors
- Archived for records

## Troubleshooting

### Email not sending

1. **Check environment variables:** Make sure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set correctly
2. **Verify App Password:** Try generating a new App Password
3. **Check console logs:** Look for error messages in the terminal
4. **Gmail security:** Ensure your account hasn't flagged the activity as suspicious

### Common Errors

- **"Invalid login"**: App Password is incorrect or not set
- **"No email address found"**: User is not logged in or email is not in their profile
- **"Failed to send email"**: Check internet connection and Gmail service status

## Production Deployment

For production:

1. Add the environment variables to your hosting platform (Vercel, Railway, etc.)
2. Use the production domain for `NEXT_PUBLIC_APP_URL`
3. Consider using a dedicated email service like SendGrid or AWS SES for higher volume
4. Monitor email delivery rates and bounces

## Alternative Email Services

If you prefer not to use Gmail, you can modify `/src/app/api/parent-dashboard/send-email/route.ts` to use:

- **SendGrid**
- **AWS SES**
- **Mailgun**
- **Postmark**

Just update the `nodemailer.createTransporter()` configuration.

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate App Passwords** periodically
4. **Monitor Gmail activity** for suspicious logins
5. **Rate limit** email sending to prevent abuse
6. **Validate user permissions** before sending emails

## Support

If you need help setting this up, please contact the development team or refer to:

- [Nodemailer Documentation](https://nodemailer.com/)
- [Google App Passwords Help](https://support.google.com/accounts/answer/185833)

