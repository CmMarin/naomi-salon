import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const generateBookingConfirmationEmail = (booking: any, serviceName: string) => {
  const appointmentDate = new Date(`${booking.appointment_date}T${booking.appointment_time}`);
  const formattedDate = appointmentDate.toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = booking.appointment_time;

  return {
    subject: `Confirmare programare la ${process.env.SALON_NAME}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmare Programare</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap');
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .salon-name { font-family: 'Dancing Script', cursive; font-weight: 700; font-size: 1.8em; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #d97706; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
          .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="salon-name">✂️ ${process.env.SALON_NAME}</h1>
          <h2>Confirmare Programare</h2>
        </div>
        
        <div class="content">
          <p>Bună ziua <strong>${booking.customer_name}</strong>,</p>
          
          <p>Vă confirmăm programarea dumneavoastră la ${process.env.SALON_NAME}. Iată detaliile:</p>
          
          <div class="booking-details">
            <h3 style="color: #d97706; margin-top: 0;">📅 Detalii Programare</h3>
            <div class="detail-row">
              <span class="detail-label">Serviciu:</span>
              <span>${serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Data:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ora:</span>
              <span>${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Client:</span>
              <span>${booking.customer_name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Telefon:</span>
              <span>${booking.customer_phone}</span>
            </div>
            ${booking.notes ? `
            <div class="detail-row">
              <span class="detail-label">Observații:</span>
              <span>${booking.notes}</span>
            </div>
            ` : ''}
          </div>

          <div class="warning">
            <strong>⚠️ Important:</strong> Vă rugăm să ajungeți cu 5 minute înainte de programare. 
            În cazul în care nu puteți veni, vă rugăm să ne anunțați cu cel puțin 24 de ore înainte.
          </div>

          <p>Abia așteptăm să vă întâlnim!</p>
          
          <p>Cu stimă,<br>
          <strong>Echipa ${process.env.SALON_NAME}</strong></p>
        </div>
        
        <div class="footer">
          <p><strong class="salon-name">${process.env.SALON_NAME}</strong></p>
          <p>📍 ${process.env.SALON_ADDRESS}</p>
          <p>📞 ${process.env.SALON_PHONE}</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Acest email a fost generat automat. Pentru întrebări, vă rugăm să ne contactați telefonic.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
Confirmare Programare - ${process.env.SALON_NAME}

Bună ziua ${booking.customer_name},

Vă confirmăm programarea dumneavoastră:

Serviciu: ${serviceName}
Data: ${formattedDate}
Ora: ${formattedTime}
Client: ${booking.customer_name}
Telefon: ${booking.customer_phone}
${booking.notes ? `Observații: ${booking.notes}` : ''}

Vă rugăm să ajungeți cu 5 minute înainte de programare.

Cu stimă,
Echipa ${process.env.SALON_NAME}

${process.env.SALON_ADDRESS}
${process.env.SALON_PHONE}
    `
  };
};

// Send booking confirmation email
export const sendBookingConfirmation = async (booking: any, serviceName: string) => {
  // Skip if email is disabled
  if (process.env.EMAIL_ENABLED === 'false') {
    console.log('📧 Email disabled in configuration');
    return { success: true, message: 'Email disabled' };
  }

  // Skip if no email provided
  if (!booking.customer_email) {
    console.log('No email provided for booking', booking.id);
    return { success: true, message: 'No email to send' };
  }

  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
      process.env.EMAIL_USER === 'your-real-gmail@gmail.com' ||
      process.env.EMAIL_PASSWORD === 'your-16-char-app-password') {
    console.log('⚠️ Email not properly configured, skipping email send');
    console.log('💡 To enable emails: Update EMAIL_USER and EMAIL_PASSWORD in .env file');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();
    const emailContent = generateBookingConfirmationEmail(booking, serviceName);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: booking.customer_email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent:', info.messageId);
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { 
      success: false, 
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return { success: false, message: 'Email credentials not configured' };
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { 
      success: false, 
      message: 'Email configuration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};