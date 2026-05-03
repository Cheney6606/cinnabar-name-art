// 本地邮件发送服务
// 使用方法: node scripts/local-email-server.js
// 启动后访问 http://localhost:3002/send-test-email 发送测试邮件

import 'dotenv/config';
import http from 'http';
import nodemailer from 'nodemailer';

const PORT = 3002;

// 从环境变量读取配置
const SMTP_HOST = 'smtp.qq.com';
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER || '479361281@qq.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-auth-code';
const EMAIL_FROM = process.env.EMAIL_FROM || `CINNABAR <${SMTP_USER}>`;
const TEST_EMAIL = process.env.TEST_EMAIL || SMTP_USER;

// Nodemailer 配置 - QQ邮箱必须使用465端口和SSL
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// 发送邮件函数
async function sendEmail(to, subject, htmlContent, attachments = []) {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: attachments,
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message, fullError: error };
  }
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // 健康检查端点
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      service: 'CINNABAR Local Email Server',
      status: 'running',
      config: {
        smtpHost: SMTP_HOST,
        smtpPort: SMTP_PORT,
        from: EMAIL_FROM,
        testEmail: TEST_EMAIL,
      },
      endpoints: {
        'GET /': 'Health check',
        'GET /send-test-email': 'Send test email',
        'POST /send-email': 'Send custom email with PDF attachment',
      },
    }));
    return;
  }

  // 测试邮件发送端点
  if (req.url === '/send-test-email' && req.method === 'GET') {
    const testName = {
      name: {
        characters: '书韵',
        pinyin: 'Shū Yùn',
        englishMeaning: 'Scholarly Elegance',
        details: [
          { char: '书', pinyin: 'shū', meaning: 'book', etymology: 'Writing' },
          { char: '韵', pinyin: 'yùn', meaning: 'charm', etymology: 'Harmony' },
        ],
        culturalResonance: 'Scholarly elegance',
        safetyAudit: { tattoo: 'Cleared', business: 'Excellent', digital: 'Verified' },
      },
      goal: 'tattoo',
      orderId: 'TEST-' + Date.now(),
      purchaseDate: new Date().toISOString().split('T')[0],
    };

    const htmlContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9B2226; font-size: 32px; margin: 0;">CINNABAR</h1>
          <p style="color: #666; font-size: 14px;">Authentic Chinese Naming</p>
        </div>
        <div style="background: #fcf9f8; padding: 30px; border-radius: 8px;">
          <h2 style="color: #333;">Your Chinese Name Report is Ready</h2>
          <p><strong>Characters:</strong> ${testName.name.characters}</p>
          <p><strong>Pinyin:</strong> ${testName.name.pinyin}</p>
          <p><strong>Meaning:</strong> ${testName.name.englishMeaning}</p>
          <p>The complete report is attached as a PDF document.</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>© 2026 CINNABAR. Wisdom in Every Stroke.</p>
        </div>
      </div>
    `;

    const reportContent = generatePDFContent(testName);
    const pdfBuffer = Buffer.from(reportContent, 'utf-8');

    console.log('📧 Sending test email to:', TEST_EMAIL);
    const result = await sendEmail(
      TEST_EMAIL,
      `Your Cinnabar Certified Name Report - ${testName.name.characters}`,
      htmlContent,
      [{
        filename: `Cinnabar_Name_Report_${testName.name.characters}.pdf`,
        content: pdfBuffer,
      }]
    );

    res.writeHead(200);
    res.end(JSON.stringify({
      success: result.success,
      message: result.success ? 'Email sent!' : 'Failed to send email',
      details: result,
    }));
    return;
  }

  // 自定义邮件发送端点（支持PDF附件）
  if (req.url === '/send-email' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { to, subject, htmlContent, attachmentContent, attachmentName } = JSON.parse(body);
        console.log('📧 Sending email to:', to);
        console.log('📧 Subject:', subject);

        const attachments = [];
        if (attachmentContent) {
          const pdfBuffer = Buffer.from(attachmentContent, 'utf-8');
          attachments.push({
            filename: attachmentName || `Cinnabar_Report.pdf`,
            content: pdfBuffer,
          });
        }

        const result = await sendEmail(to, subject, htmlContent, attachments);

        res.writeHead(200);
        res.end(JSON.stringify({
          success: result.success,
          message: result.success ? 'Email sent!' : 'Failed to send email',
          details: result,
        }));
      } catch (error) {
        console.error('❌ Request error:', error.message);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // 默认响应
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  CINNABAR Local Email Server');
  console.log('========================================');
  console.log('');
  console.log(`  Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('  SMTP Configuration:');
  console.log(`    Host: ${SMTP_HOST}`);
  console.log(`    Port: ${SMTP_PORT}`);
  console.log(`    From: ${EMAIL_FROM}`);
  console.log('');
  console.log('  Endpoints:');
  console.log(`    GET  /             - Health check`);
  console.log(`    GET  /send-test-email  - Send test email`);
  console.log(`    POST /send-email       - Send email with attachment`);
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('');
});

function generatePDFContent(data) {
  const { name, goal, purchaseDate, orderId } = data;

  const strokeGrid = name?.characters?.split('').map((char) => `
    ┌─────────────────────────────────┐
    │                                 │
    │           ╱     ╲               │
    │          ╱   ${char}    ╲              │
    │         ╱    ╱╲    ╲             │
    │        ╱   ╱  ╲    ╲            │
    │       │    │  │    │            │
    │        ╲   ╲  ╱    ╱            │
    │         ╲   ╲╱    ╱             │
    │          ╲   │   ╱              │
    │           ╲     ╱               │
    │            ─────                │
    │                                 │
    └─────────────────────────────────┘
    Character: ${char}`).join('\n') || '';

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

${name?.details?.map((detail, i) => `
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
                              CHARACTER GRID (米字格)
================================================================================

The grid below shows the proper stroke order for each character.

${strokeGrid}

================================================================================
                               DISCLAIMER
================================================================================

This report is generated by CINNABAR - Authentic Chinese Naming Service.
All names are verified for cultural safety and appropriateness.
For questions or concerns, please contact our support team.

© 2026 CINNABAR. Wisdom in Every Stroke.

================================================================================
`;
}
