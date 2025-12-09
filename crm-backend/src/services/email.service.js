import nodemailer from 'nodemailer';

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  // Use environment variables
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT, // typically 465 or 587
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // email user
    pass: process.env.EMAIL_PASS, // email password
  },
  // TLS/SSL settings for development/production
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

/**
 * Sends an email when a lead's status is updated.
 * @param {string} recipientEmail - Recipient email (usually the lead owner)
 * @param {string} leadName - Lead full name
 * @param {string} newStatus - New lead status (e.g., 'QUALIFIED', 'WON')
 * @param {string} userName - Name of the user who made the update
 */
export const sendLeadStatusUpdateEmail = async (recipientEmail, leadName, newStatus, userName) => {
  try {
    // Build dynamic email content with newStatus and userName
    const mailOptions = {
      from: `CRM System <${process.env.EMAIL_USER}>`, // sender
      to: recipientEmail, // recipient
      subject: `Lead Status Update: ${leadName} is now ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #007bff;">Lead Status Updated!</h2>
            <p>Dear team,</p>
            <p>The lead <strong>${leadName}</strong> status has been updated.</p>
            
            <p style="font-size: 1.2em; padding: 10px; background-color: #f4f4f4; border-radius: 4px;">
                New status: <strong>${newStatus}</strong>
            </p>
            
            <p>This update was performed by <strong>${userName}</strong>.</p>

            <p>Thanks, <br> CRM Automation Team</p>
        </div>
      `,
      text: `Lead Status Updated! Lead ${leadName} is now ${newStatus}. This update was performed by ${userName}.`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${recipientEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    // Log error status
    console.error(`❌ ERROR: Failed to send lead status update email to ${recipientEmail}.`, error.message);
    console.log('--- Email Content (Fallback Log) ---');
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: Lead Status Update: ${leadName} is now ${newStatus}`);
    console.log(`Body: Lead ${leadName} is now ${newStatus}. Updated by ${userName}.`);
    console.log('------------------------------------');
  }
};


/**
 * Sends a password reset email.
 * @param {string} recipientEmail 
 * @param {string} resetUrl 
 */
export const sendPasswordResetEmail = async (recipientEmail, resetUrl) => {
    try {
        const mailOptions = {
            from: `CRM System <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Please click the link below to reset your password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
            text: `You requested a password reset. Click here: ${resetUrl}`,
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${recipientEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send password reset email to ${recipientEmail}`, error);
        console.log(`Fallback: Reset URL is ${resetUrl}`);
    }
};