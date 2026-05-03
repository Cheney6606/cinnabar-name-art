// Email Service - 使用 Nodemailer 发送邮件
// 本地开发调试用

import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  pdfContent?: string;
}

interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

// 【新增功能代码】Nodemailer 配置 - 本地调试用
// 使用 QQ 邮箱 SMTP 服务
const createTransporter = async () => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: '479361281@qq.com',
      pass: 'your-auth-code',
    },
  });

  return transporter;
};

export async function sendReportEmail(params: SendEmailParams): Promise<EmailResult> {
  const { to, subject, htmlContent, pdfContent } = params;

  if (!isValidEmail(to)) {
    return {
      success: false,
      message: 'Invalid email address'
    };
  }

  try {
    const transporter = await createTransporter();

    const mailOptions: any = {
      from: '"CINNABAR" <479361281@qq.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    };

    if (pdfContent) {
      mailOptions.attachments = [
        {
          filename: 'CINNABAR_Name_Report.pdf',
          content: Buffer.from(pdfContent, 'utf-8'),
          contentType: 'application/pdf',
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    console.log('📧 Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('PDF Attachment:', pdfContent ? 'Yes' : 'No');

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      message: `Failed to send email: ${(error as Error).message}`
    };
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateEmailContent(customerName: string, nameData?: any): string {
  const nameInfo = nameData ? `
    <div style="background: #fcf9f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #9B2226; margin-bottom: 10px;">Your Chinese Name</h3>
      <p><strong>Characters:</strong> ${nameData.characters || 'N/A'}</p>
      <p><strong>Pinyin:</strong> ${nameData.pinyin || 'N/A'}</p>
      <p><strong>Meaning:</strong> ${nameData.englishMeaning || 'N/A'}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Georgia, serif; line-height: 1.6; color: #1b1c1c; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #9B2226; }
        .content { background: #fcf9f8; padding: 30px; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CINNABAR</div>
        </div>
        <div class="content">
          <h2>Your Chinese Name Report is Ready</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your purchase! Your authentic Chinese name report is ready.</p>
          ${nameInfo}
          <p>The complete report with detailed etymology, cultural significance, and safety audit is attached to this email.</p>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>With wisdom in every stroke,</p>
          <p><strong>The CINNABAR Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 CINNABAR. Wisdom in Every Stroke.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generatePDFContent(nameData: any): string {
  const { name, goal, purchaseDate, orderId } = nameData;

  return `
================================================================================
                           CINNABAR CHINESE NAME REPORT
================================================================================

ORDER INFORMATION
--------------------------------------------------------------------------------
Order ID: ${orderId || 'N/A'}
Purchase Date: ${purchaseDate || new Date().toISOString().split('T')[0]}
Primary Goal: ${goal || 'N/A'}

================================================================================
                               YOUR CHINESE NAME
================================================================================

CHARACTER(S): ${name?.characters || 'N/A'}
PINYIN: ${name?.pinyin || 'N/A'}
ENGLISH MEANING: ${name?.englishMeaning || 'N/A'}

--------------------------------------------------------------------------------
                            CHARACTER BREAKDOWN
--------------------------------------------------------------------------------

${name?.details?.map((detail: any, i: number) => `
[Character ${i + 1}] ${detail.char}
Pinyin: ${detail.pinyin}
Meaning: ${detail.meaning}
Etymology: ${detail.etymology}
`).join('\n') || 'N/A'}

--------------------------------------------------------------------------------
                           CULTURAL RESONANCE
--------------------------------------------------------------------------------

${name?.culturalResonance || 'N/A'}

--------------------------------------------------------------------------------
                              SAFETY AUDIT
--------------------------------------------------------------------------------

Tattoo Application: ${name?.safetyAudit?.tattoo || 'N/A'}
Business Usage: ${name?.safetyAudit?.business || 'N/A'}
Digital Presence: ${name?.safetyAudit?.digital || 'N/A'}

================================================================================
                               DISCLAIMER
================================================================================

This report is generated by CINNABAR - Authentic Chinese Naming Service.
All names are verified for cultural safety and appropriateness.

© 2026 CINNABAR. Wisdom in Every Stroke.

================================================================================
`;
}
