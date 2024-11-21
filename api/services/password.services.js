const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const AccountEmail = process.env.ACCOUNT;
const Password = process.env.PASS;

class PasswordService {
  static async forgotPw(email) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error('User not found');
      }

      const token = jwt.sign({ email: user.email }, jwtSecretKey, { expiresIn: '1h' });
      const resetUrl = `http://Copas-token/token=${token}`;

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: AccountEmail,
          pass: Password,
        },
      });

      const data = await ejs.renderFile(path.join(__dirname, '../../views/email.ejs'), { name: user.name, resetUrl });

      const mailOptions = {
        from: AccountEmail,
        to: email,
        subject: 'Reset Password Request',
        html: data,
      };

      await transporter.sendMail(mailOptions);

      return { message: 'Reset password link has been sent to your email' };

    } catch (error) {
      throw new Error(error.message || 'Error in forgot password process');
    }
  }

  static async resetPw(token, newPassword) {
    try {
      const decoded = jwt.verify(token, jwtSecretKey);
      const email = decoded.email;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: AccountEmail,
          pass: Password,
        },
      });

      const mailOptions = {
        from: AccountEmail,
        to: email,
        subject: 'Password Reset Successful',
        html: `<p>Hi ${user.name},</p><p>Your password has been reset successfully.</p>`,
      };

      await transporter.sendMail(mailOptions);

      // eslint-disable-next-line no-undef
      global.io.emit('notification', `Halo ${user.name}!, Reset password berhasil!`);
      console.log('Notification sent:', user.name);

      return { message: `${user.name}, password Anda berhasil di-reset!` };

    } catch (error) {
      throw new Error(error.message || 'Invalid or expired token');
    }
  }
}

module.exports = PasswordService;
