import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendVerifyEmail(email: string, token: string) {
    const link = `http://localhost:3000/auth/verify?token=${token}`;

    await this.transporter.sendMail({
      from: `"Auth App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email verification</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${link}">${link}</a>
        <p>This link is valid for 15 minutes.</p>
      `,
    });
  }
}
