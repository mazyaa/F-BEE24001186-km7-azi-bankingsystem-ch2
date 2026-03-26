/* eslint-disable no-undef */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const jwtSecretKey = process.env.JWT_SECRET_KEY;



 
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

<<<<<<< HEAD
    static async updateUser(userId, data){
        return await prisma.user.update({
            where: {
                id : userId,
            },  
=======
    return await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });
  }
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e

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

<<<<<<< HEAD
        if (!user) {
            throw new Error(`User not found`);
        }
=======
    // baru delete usernya
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
>>>>>>> ba5e30f1a21ec73d1201cf479c9f475c5559bf2e

  async getPassword() {
    const encryptedPassword = await bcrypt.hash(this.password, 10);
    return encryptedPassword;
  }
}

exports.User = User;
