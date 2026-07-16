import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    const provider = this.configService.get<string>('WHATSAPP_PROVIDER', 'console').toLowerCase();

    this.logger.log(`Sending OTP using provider: ${provider}`);

    switch (provider) {
      case 'twilio':
        return this.sendViaTwilio(mobileNumber, otp);
      case 'meta':
        return this.sendViaMeta(mobileNumber, otp);
      case 'console':
      default:
        return this.sendViaConsole(mobileNumber, otp);
    }
  }

  private async sendViaConsole(mobileNumber: string, otp: string): Promise<boolean> {
    const divider = '='.repeat(50);
    this.logger.log(`
${divider}
📱 WHATSAPP MOCK OTP SENDER
TO: ${mobileNumber}
MESSAGE: Your Gentlemen Cricket Ground verification code is: ${otp}. It will expire in 5 minutes.
${divider}
    `);
    return true;
  }

  private async sendViaTwilio(mobileNumber: string, otp: string): Promise<boolean> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const from = this.configService.get<string>('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !from) {
      this.logger.error('Twilio credentials or FROM number are missing in environment variables.');
      return false;
    }

    const formattedTo = mobileNumber.startsWith('whatsapp:') ? mobileNumber : `whatsapp:${mobileNumber}`;
    const formattedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
    const body = `Your Gentlemen Cricket Ground verification code is: ${otp}. It will expire in 5 minutes.`;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', formattedTo);
      formData.append('From', formattedFrom);
      formData.append('Body', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Twilio API responded with error status ${response.status}: ${errorText}`);
        return false;
      }

      const data = await response.json();
      this.logger.log(`Twilio message sent successfully. SID: ${data.sid}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send OTP via Twilio', error);
      return false;
    }
  }

  private async sendViaMeta(mobileNumber: string, otp: string): Promise<boolean> {
    const accessToken = this.configService.get<string>('META_ACCESS_TOKEN');
    const phoneId = this.configService.get<string>('META_PHONE_NUMBER_ID');
    const templateName = this.configService.get<string>('META_TEMPLATE_NAME');

    if (!accessToken || !phoneId) {
      this.logger.error('Meta credentials (META_ACCESS_TOKEN / META_PHONE_NUMBER_ID) are missing.');
      return false;
    }

    const cleanTo = mobileNumber.replace(/[^0-9]/g, '');

    try {
      const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

      let requestBody: any;

      if (templateName) {
        requestBody = {
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_US',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: otp,
                  },
                ],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [
                  {
                    type: 'text',
                    text: otp,
                  },
                ],
              },
            ],
          },
        };
      } else {
        requestBody = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanTo,
          type: 'text',
          text: {
            preview_url: false,
            body: `Your Gentlemen Cricket Ground verification code is: ${otp}. It will expire in 5 minutes.`,
          },
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Meta API responded with error status ${response.status}: ${errorText}`);
        return false;
      }

      const data = await response.json();
      this.logger.log(`Meta WhatsApp message sent successfully. ID: ${data.messages?.[0]?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send OTP via Meta Cloud API', error);
      return false;
    }
  }
}
