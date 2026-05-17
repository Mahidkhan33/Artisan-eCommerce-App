import nodemailer from "nodemailer";

export type EmailResult = {
  success: boolean;
  message: string;
};

const getTransporter = () => {
  const user = process.env.SMTP_MAIL;
  const pass = process.env.SMTP_PASSWORD;
  const host = process.env.SMTP_HOST;
  const service = process.env.SMTP_SERVICE;
  const portStr = process.env.SMTP_PORT;

  if (!user || !pass) {
    return null;
  }

  const config: any = {
    auth: { user, pass },
  };

  if (service) {
    config.service = service;
  } else if (host && portStr) {
    config.host = host;
    config.port = parseInt(portStr, 10);
    config.secure = portStr === "465";
  } else {
    return null;
  }

  return nodemailer.createTransport(config);
};

const getFromEmail = () => process.env.ADMIN_EMAIL || process.env.SMTP_MAIL || "no-reply@artisanalley.com";
const getFromName = () => "ArtisanAlley Marketplace";

export const sendVerificationEmail = async (
  email: string,
  username: string,
  otp: string
): Promise<EmailResult> => {
  console.log(`
==================================================
📬 [EMAIL VERIFICATION CODE SENT]
To: ${email} (${username})
Code: ${otp}
Expiration: 1 hour
==================================================
  `);

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: true,
      message: "[Local Dev Mode] Verification code logged to terminal console successfully.",
    };
  }

  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #c2410c; text-align: center;">Verify Your Account</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Thank you for joining ArtisanAlley Marketplace! Please use the following One-Time Password (OTP) to complete your registration:</p>
        <div style="background-color: #fdf9f6; border: 2px dashed #c2410c; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 4px; padding: 15px; margin: 20px 0; color: #7c2d12;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 1 hour. If you did not request this verification, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} ArtisanAlley. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${getFromName()}" <${getFromEmail()}>`,
      to: email,
      subject: "Verify your ArtisanAlley account",
      html,
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error: any) {
    console.error("❌ Failed to send verification email:", error);
    return {
      success: false,
      message: `Failed to send verification email: ${error.message || error}`,
    };
  }
};

export const sendResetPasswordEmail = async (
  email: string,
  username: string,
  resetUrl: string
): Promise<EmailResult> => {
  console.log(`
==================================================
📬 [PASSWORD RESET LINK SENT]
To: ${email} (${username})
Reset Link: ${resetUrl}
Expiration: 1 hour
==================================================
  `);

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: true,
      message: "[Local Dev Mode] Password reset link logged to terminal console successfully.",
    };
  }

  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ef4444; text-align: center;">Reset Your Password</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your password. You can reset it by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #c2410c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="word-break: break-all; font-size: 12px; color: #64748b; text-align: center;">
          Or copy and paste this link in your browser: <br/>
          <a href="${resetUrl}" style="color: #c2410c;">${resetUrl}</a>
        </p>
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} ArtisanAlley. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${getFromName()}" <${getFromEmail()}>`,
      to: email,
      subject: "Reset your ArtisanAlley password",
      html,
    });

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch (error: any) {
    console.error("❌ Failed to send reset password email:", error);
    return {
      success: false,
      message: `Failed to send reset password email: ${error.message || error}`,
    };
  }
};
