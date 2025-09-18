import { logger } from '../common/logger.js';

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

class EmailService {
  private sent: EmailPayload[] = [];

  async send(payload: EmailPayload) {
    this.sent.push(payload);
    logger.info('notification.email.sent', { to: payload.to, subject: payload.subject });
    return { id: `mail_${this.sent.length}` };
  }

  getSent() {
    return this.sent;
  }

  clear() {
    this.sent = [];
  }
}

export const emailService = new EmailService();
