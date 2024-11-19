/* eslint-disable no-undef */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const path = require('path');
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const AccountEmail = process.env.ACCOUNT;
const Password = process.env.PASS;



 
dotenv.config({ path: ".env" });

class User {
  id = null;
  name = null;
  email = null;
  password = null;

  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async register() {
    const existingUser = await prisma.user.findUnique({
      where: { email: this.email },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const encryptedPassword = await bcrypt.hash(this.password, 10);

    const user = await prisma.user.create({
      data: {
        name: this.name,
        email: this.email,
        password: encryptedPassword,
      },
    });

    this.id = user.id;

    global.io.emit('notification', `Halo ${user.name}!, Welcome!`);
    console.log('Notification sent:', user.name);
    return user;
  }

  async login() {
    const user = await prisma.user.findUnique({
      where: { email: this.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(this.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect password");
    }

    const token = jwt.sign({ email: user.email }, jwtSecretKey, {
      expiresIn: "1h",
    });

    return { user, token };
  }

  static async getAllData() {
    return await prisma.user.findMany();
  }

  static async getById(userId) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });
  }

  static async updateUser(userId, data) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedData = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });
  }

  static async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // delete dulu profilenya
    await prisma.profile.deleteMany({
      where: {
        userId: userId,
      },
    });

    // baru delete usernya
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async getPassword() {
    const encryptedPassword = await bcrypt.hash(this.password, 10);
    return encryptedPassword;
  }

  static async forgotPw(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
      throw new Error('User not found');
    }
     const token = jwt.sign({ email: user.email }, jwtSecretKey, {
      expiresIn: '1h', // Token berlaku selama 1 jam
    });

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

    const data = await ejs.renderFile(
      path.join(__dirname, '../../views/email.ejs'),
      {
        name: user.name,
        resetUrl 
      }
    );

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
    // Verifikasi token
    const decoded = jwt.verify(token, jwtSecretKey);
    const email = decoded.email;

    // Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password pengguna di database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Kirimkan email konfirmasi
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
      html: `
        <p>Hi ${user.name},</p>
        <p>Your password has been reset successfully.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

     
    global.io.emit('notification', `${user.name}, password Anda berhasil di-reset!`);
    console.log('Notification sent:', user.name);

  } catch (error) {
    throw new Error(error.message || 'Invalid or expired token');
    }
  }
}

exports.User = User;
