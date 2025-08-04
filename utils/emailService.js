const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = (to, name, verificationLink) => {
  const mailOptions = {
    from: `"Recipe App" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Please verify your email address',
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you did not register, please ignore this email.</p>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        reject(error);
      } else {
        console.log('Verification email sent:', info.response);
        resolve(info);
      }
    });
  });
};

const sendPasswordResetEmail = (to, resetLink) => {
  const mailOptions = {
    from: `"Recipe App" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password reset email:', error);
        reject(error);
      } else {
        console.log('Password reset email sent:', info.response);
        resolve(info);
      }
    });
  });
};

module.exports = {
  transporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
