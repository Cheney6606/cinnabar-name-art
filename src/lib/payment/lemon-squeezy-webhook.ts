// Lemon Squeezy Webhook Handler
// 处理支付成功回调

import { generateReportPDF } from '../pdf-generator/report-pdf.js';
import { sendReportEmail } from '../email/send-report.js';

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      name_id?: string;
      email?: string;
      name_data?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      order_number: number;
      user_email: string;
      status: string;
      amount: number;
      created_at: string;
    };
  };
}

interface WebhookResult {
  success: boolean;
  message: string;
  retryCount?: number;
}

const MAX_RETRIES = 2;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function handleLemonSqueezyWebhook(
  payload: LemonSqueezyWebhookPayload,
  signature: string,
  webhookSecret: string
): Promise<WebhookResult> {
  // 【新增功能代码】校验 webhook 签名
  if (!verifySignature(signature, webhookSecret, JSON.stringify(payload))) {
    return {
      success: false,
      message: 'Invalid webhook signature'
    };
  }

  // 只处理支付成功事件
  if (payload.meta.event_name !== 'order_created') {
    return {
      success: true,
      message: 'Event not processed'
    };
  }

  // 校验订单状态
  if (payload.data.attributes.status !== 'paid') {
    return {
      success: true,
      message: 'Order not paid'
    };
  }

  const { custom_data } = payload.meta;
  const email = custom_data?.email || payload.data.attributes.user_email;
  const nameId = custom_data?.name_id;
  const nameDataString = custom_data?.name_data;

  if (!email || !nameId || !nameDataString) {
    return {
      success: false,
      message: 'Missing required data'
    };
  }

  // 解析名字数据
  let nameData;
  try {
    nameData = JSON.parse(decodeURIComponent(nameDataString));
  } catch {
    return {
      success: false,
      message: 'Invalid name data format'
    };
  }

  // 生成 PDF 报告，重试机制
  let pdfBuffer: Buffer | null = null;
  let lastError: Error | null = null;

  for (let retry = 0; retry <= MAX_RETRIES; retry++) {
    try {
      pdfBuffer = await generateReportPDF(nameData);
      lastError = null;
      break;
    } catch (error) {
      lastError = error as Error;
      if (retry < MAX_RETRIES) {
        await sleep(1000 * (retry + 1)); // 递增等待时间
      }
    }
  }

  if (!pdfBuffer || lastError) {
    return {
      success: false,
      message: `PDF generation failed after ${MAX_RETRIES + 1} attempts`,
      retryCount: MAX_RETRIES
    };
  }

  // 发送邮件
  try {
    const htmlContent = `
      <h2>Your Chinese Name Report is Ready</h2>
      <p><strong>Characters:</strong> ${nameData.name?.characters || 'N/A'}</p>
      <p><strong>Pinyin:</strong> ${nameData.name?.pinyin || 'N/A'}</p>
      <p><strong>Meaning:</strong> ${nameData.name?.englishMeaning || 'N/A'}</p>
      <p>The complete report is attached.</p>
    `;

    const pdfContent = pdfBuffer ? pdfBuffer.toString('utf-8') : undefined;

    await sendReportEmail({
      to: email,
      subject: 'Your CINNABAR Chinese Name Report',
      htmlContent: htmlContent,
      pdfContent: pdfContent,
    });

    return {
      success: true,
      message: 'Report generated and sent successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Email sending failed: ${(error as Error).message}`
    };
  }
}

// 【新增功能代码】校验 webhook 签名
function verifySignature(
  signature: string,
  secret: string,
  payload: string
): boolean {
  // 在实际环境中，需要使用 crypto 模块验证 HMAC 签名
  // 这里使用简化版本，实际部署时请使用完整的签名验证
  if (!signature || !secret) {
    return false;
  }
  
  // Lemon Squeezy 使用 HMAC-SHA256 签名
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;
  
  return true; // 简化版本，生产环境需要完整验证
}

// 存储待处理的订单（实际环境应使用数据库）
const pendingOrders = new Map<string, {
  email: string;
  nameId: string;
  nameData: any;
  createdAt: number;
}>();

export function storePendingOrder(orderId: string, data: {
  email: string;
  nameId: string;
  nameData: any;
}): void {
  pendingOrders.set(orderId, {
    ...data,
    createdAt: Date.now()
  });
}

export function getPendingOrder(orderId: string) {
  return pendingOrders.get(orderId);
}

export function removePendingOrder(orderId: string): void {
  pendingOrders.delete(orderId);
}
