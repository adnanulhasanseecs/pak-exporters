/**
 * Email Service
 * Handles sending emails for various application events
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email templates
 */
export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    subject: "Welcome to Pak-Exporters!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Welcome to Pak-Exporters!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for joining Pakistan's First Export Marketplace. We're excited to have you on board!</p>
        <p>Get started by:</p>
        <ul>
          <li>Completing your profile</li>
          <li>Browsing products and suppliers</li>
          <li>Submitting your first RFQ</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Pak-Exporters Team</p>
      </div>
    `,
    text: `Welcome to Pak-Exporters!\n\nHello ${name},\n\nThank you for joining Pakistan's First Export Marketplace.`,
  }),

  emailVerification: (name: string, verificationLink: string): EmailTemplate => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Verify Your Email</h1>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `,
    text: `Verify Your Email\n\nHello ${name},\n\nPlease verify your email by visiting: ${verificationLink}`,
  }),

  passwordReset: (name: string, resetLink: string): EmailTemplate => ({
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Password Reset Request</h1>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <p><a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
    text: `Password Reset\n\nHello ${name},\n\nReset your password: ${resetLink}`,
  }),

  rfqSubmitted: (name: string, rfqTitle: string, rfqId: string): EmailTemplate => ({
    subject: "RFQ Submitted Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">RFQ Submitted</h1>
        <p>Hello ${name},</p>
        <p>Your RFQ "${rfqTitle}" has been submitted successfully.</p>
        <p>We'll notify you when suppliers respond to your request.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rfq/${rfqId}">View RFQ</a></p>
      </div>
    `,
    text: `RFQ Submitted\n\nHello ${name},\n\nYour RFQ "${rfqTitle}" has been submitted.`,
  }),

  rfqResponse: (name: string, supplierName: string, rfqTitle: string, rfqId: string): EmailTemplate => ({
    subject: "New Response to Your RFQ",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">New RFQ Response</h1>
        <p>Hello ${name},</p>
        <p>${supplierName} has responded to your RFQ "${rfqTitle}".</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rfq/${rfqId}">View Response</a></p>
      </div>
    `,
    text: `New RFQ Response\n\nHello ${name},\n\n${supplierName} has responded to your RFQ.`,
  }),

  orderConfirmation: (name: string, orderNumber: string, orderId: string): EmailTemplate => ({
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Order Confirmed</h1>
        <p>Hello ${name},</p>
        <p>Your order ${orderNumber} has been confirmed.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${orderId}">View Order</a></p>
      </div>
    `,
    text: `Order Confirmed\n\nHello ${name},\n\nYour order ${orderNumber} has been confirmed.`,
  }),

  membershipApproved: (name: string, tier: string): EmailTemplate => ({
    subject: "Membership Application Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Membership Approved!</h1>
        <p>Hello ${name},</p>
        <p>Congratulations! Your ${tier} membership application has been approved.</p>
        <p>You can now start uploading products and accessing premium features.</p>
      </div>
    `,
    text: `Membership Approved\n\nHello ${name},\n\nYour ${tier} membership has been approved.`,
  }),
};

/**
 * Send email
 * 
 * In production, this would integrate with an email service provider like:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Resend
 * - Nodemailer with SMTP
 * 
 * @param options Email options
 * @returns Promise resolving to success status
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
  // Mock implementation - in production, this would call the actual email service
  console.log("[Email Service] Sending email:", {
    to: options.to,
    subject: options.subject,
    from: options.from || "noreply@pak-exporters.com",
  });

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In production:
  // const response = await fetch('/api/email/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(options),
  // });
  // return response.json();

  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
}

/**
 * Send email using a template
 */
export async function sendTemplatedEmail(
  template: EmailTemplate,
  to: string | string[],
  options?: Partial<EmailOptions>
): Promise<{ success: boolean; messageId?: string }> {
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    ...options,
  });
}

/**
 * Send bulk emails
 */
export async function sendBulkEmails(
  emails: EmailOptions[]
): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      success: false,
      error: result.reason?.message || "Unknown error",
    };
  });
}

