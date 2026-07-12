import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function sendContactMessage(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ success: false, error: 'name, email, and message are required' });
      return;
    }

    if (!config.gmailUser || !config.gmailAppPassword) {
      res.status(500).json({ success: false, error: 'Email service not configured' });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.gmailUser, pass: config.gmailAppPassword },
    });

    await transporter.sendMail({
      from: config.gmailUser,
      to: config.gmailUser,
      subject: `[load.tube] Contact from ${name}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p><p>${message.replace(/\n/g, '<br>')}</p>`,
    });

    res.json({ success: true, data: { message: 'Message sent' } });
  } catch (err) {
    logger.error('Contact email failed', err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
}
